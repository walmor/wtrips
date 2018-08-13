import React, { Component } from 'react';
import { isBrowser } from 'react-device-detect';
import Flipper from '../lib/Flipper';
import SignIn from '../auth/SignIn';
import SignUp from '../auth/SignUp';
import history from '../../core/history';

class AuthFlipper extends Component {
  constructor({ startWith }) {
    super();
    this.state = { flip: startWith === 'signup' };
  }

  onSignUpClick = () => {
    this.setState({ flip: true });
    history.replace('/signup');
  };

  onSignInClick = () => {
    this.setState({ flip: false });
    history.replace('/signin');
  };

  render() {
    return (
      <Flipper flip={this.state.flip} className="AuthFlipper">
        <Flipper.Front>
          <SignIn resetFocus={isBrowser && !this.state.flip} onSignUpClick={this.onSignUpClick} />
        </Flipper.Front>
        <Flipper.Back>
          <SignUp resetFocus={isBrowser && this.state.flip} onSignInClick={this.onSignInClick} />
        </Flipper.Back>
      </Flipper>
    );
  }
}

export default AuthFlipper;
