import React from 'react';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

const propTypes = {
  component: PropTypes.func.isRequired,
  isSignedIn: PropTypes.func.isRequired,
};

const PrivateRoute = (props) => {
  const { component: Component, isSignedIn, ...rest } = props;

  return (
    <Route
      {...rest}
      render={(properties) => {
        if (isSignedIn()) {
          return <Component {...properties} />;
        }

        return <Redirect to="/" />;
      }}
    />
  );
};

PrivateRoute.propTypes = propTypes;

function mapStateToProps(s) {
  return {
    isSignedIn: () => s.appStore.auth.isSignedIn(),
  };
}

export default inject(mapStateToProps)(PrivateRoute);
