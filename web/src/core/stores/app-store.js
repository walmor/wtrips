import { observable } from 'mobx';
import AuthStore from './auth-store';
import UserStore from './user-store';
import history from '../history';
import ApiClient from '../api-client';
import { getCurrentRoute } from '../routes';

class AppStore {
  @observable
  currentRoute = null;

  constructor() {
    this.api = new ApiClient();
    this.auth = new AuthStore(this.api, this);
    this.users = new UserStore(this.api, this);

    history.listen((location) => {
      this.saveCurrentRoute(location);
    });

    this.saveCurrentRoute(history.location);
  }

  saveCurrentRoute(location) {
    this.currentRoute = getCurrentRoute(location.pathname);
  }

  clear() {
    this.users.clear();
    // TODO: this.trips.clear();
  }
}

export default AppStore;
