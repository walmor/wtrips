import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import PageSpin from '../../components/lib/PageSpin';
import authManager from '../../core/auth-manager';

const propTypes = {
  component: PropTypes.func.isRequired,
};

class PrivateRoute extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      isSignedIn: false,
    };
  }

  componentDidMount() {
    authManager.isSignedIn().then((isSignedIn) => {
      this.setState({
        loading: false,
        isSignedIn,
      });
    });
  }

  render() {
    if (this.state.loading) {
      return <PageSpin />;
    }

    const { component: Component, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={(props) => {
          if (this.state.isSignedIn) {
            return <Component {...props} />;
          }

          return <Redirect to="/" />;
        }}
      />
    );
  }
}

PrivateRoute.propTypes = propTypes;

export default PrivateRoute;
