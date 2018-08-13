import React from 'react';
import PropTypes from 'prop-types';

const AuthFooter = ({ children }) => (
  <div className="AuthFooter">
    <p>{children}</p>
  </div>
);

AuthFooter.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthFooter;
