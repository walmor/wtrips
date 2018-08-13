import React from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';
import { Redirect } from 'react-router-dom';
import PageSpin from '../components/lib/PageSpin';
import AuthFlipper from '../components/auth/AuthFlipper';
import authManager from '../core/auth-manager';

class AuthPage extends React.Component {
  constructor() {
    super();

    this.state = {
      loading: true,
      isSignedIn: false,
    };
  }

  async componentWillMount() {
    await authManager.init();

    const { location } = this.props;
    const state = location.state || {};
    const { error } = state;

    if (error) {
      message.error(error);
      this.setState({ loading: false });
    } else {
      const isSignedIn = await authManager.isSignedIn();

      this.setState({
        loading: false,
        isSignedIn,
      });
    }
  }

  render() {
    if (this.state.loading) {
      return <PageSpin />;
    }

    if (this.state.isSignedIn) {
      return <Redirect to="/admin" />;
    }

    return (
      <div className="AuthPage">
        <AuthFlipper startWith={this.props.match.params.action} />
      </div>
    );
  }
}

AuthPage.propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default AuthPage;
