import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'antd';

const ErrorMessage = ({ message }) => {
  const show = !!message;
  const errorClass = `ErrorMessage ${show ? 'is-visible' : ''}`;

  return (
    <div className={errorClass}>
      <Alert type="error" message={message} className="u-marginBottom" showIcon />
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string,
};

ErrorMessage.defaultProps = {
  message: null,
};

export default ErrorMessage;
