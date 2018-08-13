import React from 'react';
import PropTypes from 'prop-types';

const ContentPanel = ({ children }) => <div className="ContentPanel">{children}</div>;

ContentPanel.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ContentPanel;
