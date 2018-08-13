import React from 'react';
import PropTypes from 'prop-types';

const AuthTitle = ({ children }) => <h1 className="AuthTitle u-marginBottom">{children}</h1>;

AuthTitle.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthTitle;
