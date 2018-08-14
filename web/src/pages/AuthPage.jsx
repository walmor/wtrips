import React from 'react';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import AuthFlipper from '../components/auth/AuthFlipper';

const AuthPage = ({ match, isSignedIn }) => {
  if (isSignedIn()) {
    return <Redirect to="/admin" />;
  }

  return (
    <div className="AuthPage">
      <AuthFlipper startWith={match.params.action} />
    </div>
  );
};

AuthPage.propTypes = {
  match: PropTypes.object.isRequired,
  isSignedIn: PropTypes.func.isRequired,
};

function mapStateToProps(s) {
  return {
    isSignedIn: () => s.appStore.auth.isSignedIn(),
  };
}

export default inject(mapStateToProps)(AuthPage);
