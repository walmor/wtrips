import jwt from 'jsonwebtoken';
import { observable, action, computed } from 'mobx';
import history from '../history';
import setErrorMessage from '../get-error-message';

const AUTH_TOKEN_KEY = 'authToken';
const SIGNIN_URL = '/auth/signin';
const SIGNUP_URL = '/auth/signup';
const RENEW_TOKEN_URL = '/auth/renew-token';
const EMAIL_AVAILABLE_URL = '/auth/email-available';

class AuthStore {
  @observable
  currentUser = null;

  @observable
  loading = false;

  @observable
  signInError = null;

  @observable
  signUpError = null;

  constructor(apiClient, appStore) {
    this.appStore = appStore;
    this.api = apiClient;
    this.api.onForbidden(err => this.handleForbidden(err));
    this.api.onUnauthorized(err => this.handleUnauthorized(err));
    this.api.onNotFound(err => this.handleNotFound(err));
  }

  @action
  isSignedIn() {
    const token = this.getToken();

    if (!token) return false;
    if (this.currentUser) return true;

    return this.setToken(token);
  }

  @action
  async signIn(email, password) {
    this.authenticate(SIGNIN_URL, { email, password }, (msg) => {
      this.signInError = msg;
    });
  }

  @action
  async signUp(name, email, password) {
    this.authenticate(SIGNUP_URL, { name, email, password }, (msg) => {
      this.signUpError = msg;
    });
  }

  @action
  signOut(error) {
    this.clearToken();

    this.appStore.clear();

    this.redirectToSignInPage(error);
  }

  @action
  editProfile() {
    this.appStore.users.editUser(this.currentUser._id);
  }

  async isEmailAvailable(email) {
    return this.api.get(EMAIL_AVAILABLE_URL, { email });
  }

  @computed
  get canManageUsers() {
    if (!this.currentUser) return false;
    const { role } = this.currentUser;
    return role === 'manager' || role === 'admin';
  }

  async authenticate(endpoint, data, setError) {
    try {
      this.loading = true;
      this.signInError = null;
      this.signUpError = null;
      this.clearToken();

      const { token } = await this.api.post(endpoint, data);

      if (!this.setToken(token)) {
        throw new Error();
      }

      this.redirectToAdminPage();
    } catch (err) {
      setErrorMessage(err, setError);
    } finally {
      this.loading = false;
    }
  }

  handleForbidden() {
    this.redirectToAdminPage('Access denied.');
  }

  handleUnauthorized(err) {
    if (this.loading) {
      this.signInError = err.message;
    } else {
      this.signOut('Your session has expired. Please sign in again.');
    }
  }

  handleNotFound() {
    this.redirectToAdminPage('The resource you are trying to access does not exist on the server.');
  }

  async renewToken() {
    try {
      const { token } = await this.api.get(RENEW_TOKEN_URL);
      this.setToken(token);
    } catch (err) {
      // In case of error, the user will be
      // redirected to sign in page on next request.
    }
  }

  setToken(token) {
    const decoded = jwt.decode(token);

    if (!decoded) {
      this.clearToken();
      return false;
    }

    this.currentUser = this.appStore.users.observeUser(decoded.user);

    localStorage.setItem(AUTH_TOKEN_KEY, token);
    this.api.setToken(token);

    return true;
  }

  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  clearToken() {
    this.currentUser = null;
    this.api.clearToken();
    return localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  redirectToSignInPage(error) {
    const state = error ? { error } : undefined;
    history.push('/signin', state);
  }

  redirectToAdminPage(error) {
    const state = error ? { error } : undefined;
    history.push('/admin', state);
  }
}

export default AuthStore;
