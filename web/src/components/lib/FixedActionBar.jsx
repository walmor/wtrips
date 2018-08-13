import React from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';

class FixedActionBar extends React.Component {
  constructor() {
    super();
    this.state = {
      left: 0,
      width: '100%',
    };
  }

  componentDidMount() {
    this.observer = new ResizeObserver((entries) => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const { width } = entry.contentRect;

        this.setState({
          left: entry.target.offsetLeft,
          width,
        });
      }
    });

    this.observer.observe(document.getElementById('content'));
  }

  componentWillUnmount() {
    this.observer.disconnect();
    this.observer = null;
  }

  render() {
    const { left, width } = this.state;
    return (
      <div style={{ left, width }} className="FixedActionBar">
        {this.props.children}
      </div>
    );
  }
}

FixedActionBar.propTypes = {
  children: PropTypes.node.isRequired,
};

export default FixedActionBar;
