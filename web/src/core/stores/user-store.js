import { observable, action, runInAction } from 'mobx';
import queryString from 'query-string';
import history from '../history';
import setErrorMessage from '../get-error-message';

const PAGE_SIZE = 10;
const USERS_URL = '/users/';

export default class UserStore {
  @observable
  allUsers = new Map();

  @observable
  users = [];

  @observable
  pagination;

  @observable
  query;

  @observable
  loading = false;

  @observable
  error = null;

  @observable
  userEditing;

  constructor(apiClient, appStore) {
    this.appStore = appStore;
    this.api = apiClient;
    this.loaded = false;

    this.init();
  }

  @action
  async load() {
    if (this.loaded) return;
    this.loaded = true;

    this.setRoles();

    this.unlistenHistory = history.listen(async (location) => {
      if (location.pathname.startsWith('/admin/users')) {
        await this.loadUsers();
      }
    });

    await this.loadUsers();
  }

  @action
  async loadUsers() {
    try {
      this.updateQueryString();
      this.loading = true;

      const response = await this.fetchUsers(this.query);

      runInAction(() => {
        this.loading = false;
        this.pagination.total = response.totalCount;
        this.pagination.current = this.query.page;
        this.users.replace(response.users);
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
  editUser(id) {
    const user = this.allUsers.get(id);
    if (!user) return;
    const { currentUser } = this.appStore.auth;

    this.userEditing.isEditing = true;
    this.userEditing.user = user;
    this.userEditing.isCurrentUser = user.id === currentUser.id;
  }

  @action
  async saveUser(user) {
    try {
      this.userEditing.error = null;
      this.userEditing.isSaving = true;

      const usr = await this.api.put(USERS_URL + user.id, user);

      if (this.userEditing.isCurrentUser) {
        await this.appStore.auth.renewToken();
      }

      runInAction(() => {
        this.observeUser(usr);
        this.endEditing();
      });
    } catch (err) {
      setErrorMessage(err, (msg) => {
        this.userEditing.error = msg;
      });
    } finally {
      this.userEditing.isSaving = false;
    }
  }

  @action
  endEditing() {
    Object.assign(this.userEditing, {
      isEditing: false,
      isSaving: false,
      error: null,
      user: null,
      isCurrentUser: false,
    });
  }

  @action
  init() {
    this.loaded = false;
    this.loading = false;
    this.error = null;
    this.allUsers.clear();
    this.users.clear();
    this.roles = {};

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
    };

    this.userEditing = {
      isEditing: false,
      isSaving: false,
      error: null,
      user: null,
      isCurrentUser: false,
      saveUser: id => this.saveUser(id),
      cancelEditing: () => this.endEditing(),
      roles: {},
    };
  }

  @action
  setRoles() {
    const { currentUser } = this.appStore.auth;

    const roles = {
      user: 'User',
      manager: 'Manager',
    };

    if (currentUser.role === 'admin') {
      roles.admin = 'Admin';
    }

    this.roles = roles;
    this.userEditing.roles = roles;
  }

  @action
  clear() {
    this.init();
    if (this.unlistenHistory) {
      this.unlistenHistory();
    }
  }

  async fetchUsers(query) {
    const response = await this.api.get(USERS_URL, query);
    response.users = response.users.map(u => this.observeUser(u));
    return response;
  }

  @action
  observeUser(user) {
    let obsUser = this.allUsers.get(user.id);

    if (obsUser) {
      Object.assign(obsUser, user);
    } else {
      this.allUsers.set(user.id, user);
      obsUser = this.allUsers.get(user.id);
    }

    return obsUser;
  }

  pushLocation(query) {
    const qs = { ...this.query, ...query };

    if (qs.page === 1) {
      qs.page = undefined;
    }

    if (!qs.search) {
      qs.search = undefined;
    }

    delete qs.pageSize;

    const order = ['search', 'page'];

    const search = queryString.stringify(qs, {
      sort: (m, n) => order.indexOf(m) >= order.indexOf(n),
    });

    const location = {
      pathname: '/admin/users',
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
  }
}
