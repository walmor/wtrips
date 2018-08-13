import history from './history';

const AUTH_TOKEN_KEY = 'authToken';

const authManager = {
  init() {},

  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  async isSignedIn() {
    return !!this.getToken();
  },

  signin(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    this.redirectToAdminPage();
  },

  async signout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    this.redirectToSignInPage();
  },

  redirectToSignInPage() {
    history.push('/signin');
  },

  redirectToAdminPage() {
    history.push('/admin');
  },
};

export default authManager;
