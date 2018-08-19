import React from 'react';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { message } from 'antd';
import { Redirect } from 'react-router-dom';
import AuthFlipper from '../components/auth/AuthFlipper';

class AuthPage extends React.Component {
  componentDidMount() {
    const { location } = this.props;
    const error = location.state && location.state.error;
    if (error) {
      message.error(error);
    }
  }

  render() {
    const { match, isSignedIn } = this.props;

    if (isSignedIn()) {
      return <Redirect to="/admin" />;
    }

    return (
      <div className="AuthPage">
        <AuthFlipper startWith={match.params.action} />
      </div>
    );
  }
}

AuthPage.propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  isSignedIn: PropTypes.func.isRequired,
};

function mapStateToProps(s) {
  return {
    isSignedIn: () => s.appStore.auth.isSignedIn(),
  };
}

export default inject(mapStateToProps)(AuthPage);
