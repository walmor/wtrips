import { observable, action, runInAction } from 'mobx';
import debounce from '../../core/debounce';

export default class UserSelectorStore {
  @observable
  users = [];

  @observable
  initialUser = null;

  @observable
  selectedUser = null;

  @observable
  loading = false;

  @observable
  searchValue = null;

  constructor(appStore, onlyActiveUsers = false) {
    this.appStore = appStore;
    this.onlyActiveUsers = onlyActiveUsers;
    this.search = debounce(this.search, 500);
    this.onUserSelected = null;
    this.placeholder = 'Select an user';
  }

  get mappedProps() {
    return {
      initialUser: this.initialUser,
      selectedUser: this.selectedUser,
      users: this.users,
      loading: this.loading,
      placeholder: this.placeholder,
      onSelect: id => this.select(id),
      onSearch: value => this.search(value),
      onLeave: () => this.leave(),
      onLoad: () => this.load(),
    };
  }

  @action
  async load() {
    this.populateWithCurrentUsers();

    if (this.users.length <= 1) {
      await this.fetchUsers();
    }
  }

  @action
  search = async (value) => {
    this.searchValue = value;
    await this.fetchUsers();
  };

  @action
  setInitialUser(user) {
    this.initialUser = user;
    this.selectedUser = user;
  }

  @action
  select(id) {
    const { allUsers } = this.appStore.users;

    this.selectedUser = allUsers.get(id);

    if (typeof this.onUserSelected === 'function') {
      this.onUserSelected(this.selectedUser);
    }

    this.populateWithCurrentUsers();
  }

  @action
  leave() {
    setTimeout(() => {
      this.populateWithCurrentUsers();
    }, 0);
  }

  @action
  async fetchUsers() {
    try {
      this.loading = true;
      const qs = {
        search: this.searchValue || undefined,
        isActive: this.onlyActiveUsers || undefined,
      };

      const { users } = this.appStore;
      const result = await users.fetchUsers(qs);

      runInAction(() => {
        this.populateUsers(result.users);
      });
    } finally {
      this.loading = false;
    }
  }

  @action
  populateWithCurrentUsers() {
    this.searchValue = null;
    const { allUsers } = this.appStore.users;
    this.populateUsers(Array.from(allUsers.values()));
  }

  @action
  populateUsers(users) {
    const filteredUsers = users.filter(u => this.filter(u));

    this.users.clear();

    if (
      this.initialUser &&
      !this.searchValue &&
      !filteredUsers.find(u => u._id === this.initialUser._id)
    ) {
      this.users.push(this.initialUser);
    }

    this.users.push(...filteredUsers);
  }

  filter(u) {
    const { initialUser } = this;
    const { currentUser } = this.appStore.auth;

    if (u._id === currentUser._id) return false;
    if (initialUser && u._id === initialUser._id) return true;
    if (this.onlyActiveUsers && !u.isActive) return false;

    return true;
  }
}
