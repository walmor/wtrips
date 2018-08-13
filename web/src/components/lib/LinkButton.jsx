import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const defaultProps = {
  className: null,
};

const LinkButton = (props) => {
  const { children, className, ...btnProps } = props;
  return (
    <button className={`LinkButton ${className || ''}`} {...btnProps}>
      {children}
    </button>
  );
};

LinkButton.propTypes = propTypes;
LinkButton.defaultProps = defaultProps;

export default LinkButton;
