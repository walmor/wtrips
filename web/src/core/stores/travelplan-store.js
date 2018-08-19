import { observable, action, runInAction } from 'mobx';
import queryString from 'query-string';
import moment from 'moment';
import history from '../history';
import setErrorMessage from '../get-error-message';
import UserSelectorStore from './user-selector-store';

const TRAVELPLAN_URL = '/trips/travelplan/';

export default class TravelPlanStore {
  @observable
  trips = [];

  @observable
  query;

  @observable
  loading = false;

  @observable
  error = null;

  constructor(apiClient, appStore) {
    this.appStore = appStore;
    this.api = apiClient;
    this.loaded = false;

    this.userSelector = new UserSelectorStore(appStore);
    this.userSelector.placeholder = 'Filter by user';
    this.userSelector.onUserSelected = (user) => {
      this.filter({ user: user._id });
    };

    this.init();
  }

  @action
  async load() {
    if (this.loaded) return;
    this.loaded = true;

    history.listen(async (location) => {
      if (location.pathname.startsWith('/admin/travelplan')) {
        await this.fetchTravelPlan();
      }
    });

    await this.fetchTravelPlan();
    const { auth } = this.appStore;

    if (auth.canManageUserTrips) {
      await this.userSelector.load();

      const qsUser = this.query.user;

      if (!qsUser || qsUser === 'me') {
        this.userSelector.selectedUser = null;
      } else {
        const { allUsers } = this.appStore.users;
        this.userSelector.selectedUser = allUsers.get(qsUser);
      }
    }
  }

  @action
  async fetchTravelPlan() {
    try {
      this.updateQueryString();
      this.loading = true;
      this.error = null;

      const trips = await this.api.get(TRAVELPLAN_URL, this.query);

      runInAction(() => {
        this.loading = false;
        this.trips.replace(trips);
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
  filter(data) {
    this.pushLocation(data);
  }

  @action
  init() {
    this.loading = false;
    this.error = null;
    this.trips.clear();

    this.query = {
      month: null,
      year: null,
      user: null,
      get monthFilter() {
        const now = moment();
        const month = this.month ? this.month - 1 : now.month();
        const filter = moment([this.year || now.year(), month, 1]);
        return filter;
      },
    };
  }

  @action
  clear() {
    this.init();
  }

  @action
  pushLocation(query) {
    const qs = { ...this.query, ...query };

    if (qs.user === 'all') {
      qs.user = undefined;
    }

    if (!qs.user || qs.user === 'me') {
      this.userSelector.selectedUser = null;
    }

    Object.keys(qs).forEach((key) => {
      if (!qs[key]) qs[key] = undefined;
    });

    delete qs.userId;

    const order = ['user', 'month', 'year'];

    const search = queryString.stringify(qs, {
      sort: (m, n) => order.indexOf(m) >= order.indexOf(n),
    });

    const location = {
      pathname: '/admin/travelplan',
      search,
    };

    history.push(location);
  }

  @action
  updateQueryString() {
    const qs = queryString.parse(history.location.search) || {};

    const month = parseInt(qs.month, 10);
    this.query.month = Number.isInteger(month) ? month : undefined;

    const year = parseInt(qs.year, 10);
    this.query.year = Number.isInteger(year) ? year : undefined;

    this.query.user = qs.user;

    if (!qs.user || qs.user === 'all') {
      this.query.userId = null;
    } else if (qs.user === 'me') {
      const { currentUser } = this.appStore.auth;
      this.query.userId = currentUser._id;
    } else {
      this.query.userId = qs.user;
    }
  }
}
