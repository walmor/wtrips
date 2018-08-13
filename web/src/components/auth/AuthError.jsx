import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'antd';

const AuthError = ({ message }) => {
  const show = !!message;
  const errorClass = `AuthError ${show ? 'is-visible' : ''}`;

  return (
    <div className={errorClass}>
      <Alert type="error" message={message} className="u-marginBottom" showIcon />
    </div>
  );
};

AuthError.propTypes = {
  message: PropTypes.string,
};

AuthError.defaultProps = {
  message: null,
};

export default AuthError;
