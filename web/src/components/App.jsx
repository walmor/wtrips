import React from 'react';
import { Switch, Router, Route, Redirect } from 'react-router-dom';
import history from '../core/history';
import PrivateRoute from '../components/auth/PrivateRoute';
import AdminPage from '../pages/AdminPage';
import AuthPage from '../pages/AuthPage';

const App = () => (
  <Router history={history}>
    <Switch>
      <Redirect exact from="/" to="/signin" />
      <Route exact path="/:action(signin|signup)" component={AuthPage} />
      <PrivateRoute path="/admin" component={AdminPage} />
    </Switch>
  </Router>
);

export default App;
