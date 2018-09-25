import { observable, action, runInAction } from 'mobx';
import queryString from 'query-string';
import history from '../history';
import setErrorMessage from '../get-error-message';
import UserSelectorStore from './user-selector-store';

const PAGE_SIZE = 10;
const TRIPS_URL = '/trips/';

export default class TripStore {
  @observable
  allTrips = new Map();

  @observable
  trips = [];

  @observable
  pagination;

  @observable
  query;

  @observable
  loading = false;

  @observable
  error = null;

  @observable
  editing;

  constructor(apiClient, appStore) {
    this.appStore = appStore;
    this.api = apiClient;
    this.loaded = false;

    this.userSelector = new UserSelectorStore(appStore);
    this.userSelector.placeholder = 'Filter by user';
    this.userSelector.onUserSelected = (user) => {
      this.filter({ user: user.id });
    };

    this.init();
  }

  @action
  async load() {
    if (this.loaded) return;
    this.loaded = true;

    this.unlistenHistory = history.listen(async (location) => {
      if (location.pathname.startsWith('/admin/trips')) {
        await this.fetchTrips();
      }
    });

    await this.fetchTrips();
    const { auth } = this.appStore;

    if (auth.canManageUserTrips) {
      await this.userSelector.load();
      await this.editing.userSelector.load();
      this.updateUserSelector();
    }
  }

  @action
  async fetchTrips() {
    try {
      this.updateQueryString();
      this.loading = true;
      this.error = null;

      const response = await this.api.get(TRIPS_URL, this.query);

      runInAction(() => {
        this.loading = false;
        this.pagination.total = response.totalCount;
        this.pagination.current = this.query.page;

        this.trips.replace(response.trips.map(u => this.observeTrip(u)));
      });
    } catch (err) {
      runInAction(() => {
        this.loading = false;
        setErrorMessage(err, (msg) => {
          this.error = msg;
        });
      });
    }
  }

  @action
  changePage(page) {
    this.pushLocation({ page });
  }

  @action
  search(search) {
    this.pushLocation({ page: 1, search });
  }

  @action
  filter(data) {
    this.pushLocation({ page: 1, ...data });
  }

  @action
  createTrip() {
    this.editing.trip = null;
    this.editing.userSelector.setInitialUser(null);
    this.editing.isEditing = true;
  }

  @action
  editTrip(id) {
    const trip = this.allTrips.get(id);
    if (!trip) return;

    const { currentUser } = this.appStore.auth;

    this.editing.trip = trip;

    trip.belongsToCurrUser = trip.user.id === currentUser.id;

    if (trip.belongsToCurrUser) {
      this.editing.userSelector.setInitialUser(null);
    } else {
      this.editing.userSelector.setInitialUser(trip.user);
    }

    this.editing.isEditing = true;
  }

  @action
  async saveTrip(trip) {
    try {
      this.editing.error = null;
      this.editing.isSaving = true;

      const userId = trip.user ? trip.user.id : undefined;
      const tripData = { ...trip, userId };
      let savedTrip = null;
      const isNewTrip = !trip.id;

      if (isNewTrip) {
        savedTrip = await this.api.post(TRIPS_URL, tripData);
      } else {
        savedTrip = await this.api.put(TRIPS_URL + trip.id, tripData);
      }

      runInAction(() => {
        this.observeTrip(savedTrip);
        this.endEditing();
        this.fetchTrips();
      });
    } catch (err) {
      setErrorMessage(err, (msg) => {
        this.editing.error = msg;
      });
    } finally {
      runInAction(() => {
        this.editing.isSaving = false;
      });
    }
  }

  @action
  async deleteTrip(id) {
    const trip = this.allTrips.get(id);
    if (!trip) return;
    try {
      trip.deleting = true;

      await this.api.delete(TRIPS_URL + id);

      runInAction(async () => {
        trip.deleting = false;
        await this.fetchTrips();
      });
    } catch (err) {
      runInAction(() => {
        trip.deleting = false;
        setErrorMessage((msg) => {
          this.error = msg;
        });
      });
    } finally {
      runInAction(() => {
        this.allTrips.delete(id);
      });
    }
  }

  @action
  endEditing() {
    Object.assign(this.editing, {
      isEditing: false,
      isSaving: false,
      error: null,
      trip: null,
    });
  }

  @action
  init() {
    this.loaded = false;
    this.loading = false;
    this.error = null;
    this.allTrips.clear();
    this.trips.clear();

    this.pagination = {
      pageSize: PAGE_SIZE,
      total: 0,
      current: 1,
      onChange: page => this.changePage(page),
    };

    this.query = {
      pageSize: PAGE_SIZE,
      page: 1,
      search: null,
      startDate: null,
      endDate: null,
      user: null,
    };

    this.editing = {
      isEditing: false,
      isSaving: false,
      error: null,
      trip: null,
      saveTrip: id => this.saveTrip(id),
      cancelEditing: () => this.endEditing(),
      userSelector: new UserSelectorStore(this.appStore, true),
    };
  }

  @action
  clear() {
    this.init();

    if (this.unlistenHistory) {
      this.unlistenHistory();
    }
  }

  @action
  observeTrip(trip) {
    let obsTrip = this.allTrips.get(trip.id);

    if (obsTrip) {
      Object.assign(obsTrip, trip);
    } else {
      this.allTrips.set(trip.id, trip);
      obsTrip = this.allTrips.get(trip.id);
    }

    obsTrip.user = this.appStore.users.observeUser(trip.user);

    return obsTrip;
  }

  @action
  pushLocation(query) {
    const qs = { ...this.query, ...query };

    if (qs.page === 1) {
      qs.page = undefined;
    }

    if (qs.user === 'all') {
      qs.user = undefined;
    }

    if (!qs.user || qs.user === 'me') {
      this.userSelector.selectedUser = null;
    }

    Object.keys(qs).forEach((key) => {
      if (!qs[key]) qs[key] = undefined;
    });

    delete qs.pageSize;
    delete qs.userId;

    const order = ['search', 'user', 'startDate', 'endDate', 'page'];

    const search = queryString.stringify(qs, {
      sort: (m, n) => order.indexOf(m) >= order.indexOf(n),
    });

    const location = {
      pathname: '/admin/trips',
      search,
    };

    history.push(location);
  }

  @action
  updateQueryString() {
    const qs = queryString.parse(history.location.search) || {};

    const page = parseInt(qs.page, 10);
    this.query.page = Number.isInteger(page) ? page : 1;
    this.query.search = qs.search;
    this.query.startDate = qs.startDate;
    this.query.endDate = qs.endDate;
    this.query.user = qs.user;

    if (!qs.user || qs.user === 'all') {
      this.query.userId = null;
    } else if (qs.user === 'me') {
      const { currentUser } = this.appStore.auth;
      this.query.userId = currentUser.id;
    } else {
      this.query.userId = qs.user;
    }

    this.updateUserSelector();
  }

  @action
  updateUserSelector() {
    const { auth } = this.appStore;

    const qsuser = this.query.user;

    if (auth.canManageUserTrips) {
      if (!qsuser || qsuser === 'me') {
        this.userSelector.selectedUser = null;
      } else {
        const { allUsers } = this.appStore.users;
        this.userSelector.selectedUser = allUsers.get(parseInt(qsuser, 10));
      }
    }
  }
}
