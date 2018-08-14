import { observable } from 'mobx';
import AuthStore from './auth-store';
import history from '../history';
import ApiClient from '../api-client';
import { getCurrentRoute } from '../routes';

class AppStore {
  @observable
  currentRoute = null;

  constructor() {
    this.api = new ApiClient();
    this.auth = new AuthStore(this.api);

    history.listen((location) => {
      this.saveCurrentRoute(location);
    });

    this.saveCurrentRoute(history.location);
  }

  saveCurrentRoute(location) {
    this.currentRoute = getCurrentRoute(location.pathname);
  }
}

export default AppStore;
