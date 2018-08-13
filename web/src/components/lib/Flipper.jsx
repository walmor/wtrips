import React from 'react';
import PropTypes from 'prop-types';

const FlipperFace = ({ className, children }) => (
  <div className={`FlipperFace ${className}`}>{children}</div>
);

FlipperFace.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string.isRequired,
};

const Flipper = ({ flip, className, children }) => (
  <div className={`FlipperContainer ${className || ''}`}>
    <div className={`Flipper ${flip ? 'is-flip' : ''}`}>{children}</div>
  </div>
);

Flipper.propTypes = {
  flip: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Flipper.defaultProps = {
  flip: false,
  className: null,
};

Flipper.Front = ({ children }) => <FlipperFace className="is-front">{children}</FlipperFace>;
Flipper.Back = ({ children }) => <FlipperFace className="is-back">{children}</FlipperFace>;

const flipperFacePropTypes = {
  children: PropTypes.node.isRequired,
};

Flipper.Front.propTypes = flipperFacePropTypes;
Flipper.Back.propTypes = flipperFacePropTypes;

export default Flipper;
