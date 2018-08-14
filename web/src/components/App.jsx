import React from 'react';
import { Provider } from 'mobx-react';
import { Switch, Router, Route, Redirect } from 'react-router-dom';
import history from '../core/history';
import AppStore from '../core/stores/app-store';
import PrivateRoute from '../components/auth/PrivateRoute';
import AdminPage from '../pages/AdminPage';
import AuthPage from '../pages/AuthPage';

const appStore = new AppStore();

const App = () => (
  <Provider appStore={appStore}>
    <Router history={history}>
      <Switch>
        <Redirect exact from="/" to="/signin" />
        <Route exact path="/:action(signin|signup)" component={AuthPage} />
        <PrivateRoute path="/admin" component={AdminPage} />
      </Switch>
    </Router>
  </Provider>
);

export default App;
