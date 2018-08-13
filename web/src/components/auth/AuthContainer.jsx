import React from 'react';
import PropTypes from 'prop-types';

const AuthContainer = ({ className, children }) => {
  let cssClass = 'AuthContainer u-borderBox u-containerPadding u-sizeFill ';
  cssClass += className || '';

  return <div className={cssClass}>{children}</div>;
};

AuthContainer.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

AuthContainer.defaultProps = {
  className: null,
};

export default AuthContainer;
