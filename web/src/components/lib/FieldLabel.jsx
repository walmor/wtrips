import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const defaultProps = {
  className: null,
};

const FieldLabel = (props) => {
  const { children, className, ...labelProps } = props;
  return (
    <div className={`FieldLabel ${className || ''}`} {...labelProps}>
      {children}
    </div>
  );
};

FieldLabel.propTypes = propTypes;
FieldLabel.defaultProps = defaultProps;

export default FieldLabel;
