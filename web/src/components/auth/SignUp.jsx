import React from 'react';
import PropTypes from 'prop-types';
import AuthContainer from './AuthContainer';
import AuthTitle from './AuthTitle';
import AuthFooter from './AuthFooter';
import SignUpForm from './SignUpForm';
import LinkButton from '../lib/LinkButton';

const propTypes = {
  onSignInClick: PropTypes.func.isRequired,
  resetFocus: PropTypes.bool,
};

const defaultProps = {
  resetFocus: false,
};

const SignUp = ({ onSignInClick, resetFocus }) => (
  <AuthContainer className="SignUp">
    <AuthTitle>Sign Up</AuthTitle>
    <SignUpForm resetFocus={resetFocus} />
    <AuthFooter>
      Already have an account? <LinkButton onClick={onSignInClick}>Sign in</LinkButton>
    </AuthFooter>
  </AuthContainer>
);

SignUp.propTypes = propTypes;
SignUp.defaultProps = defaultProps;

export default SignUp;
