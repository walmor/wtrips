import React from 'react';
import PropTypes from 'prop-types';
import Ellipsis from 'ftellipsis';

class ListItemDescription extends React.Component {
  componentDidMount() {
    const ellipsis = new Ellipsis(this.element);
    ellipsis.calc();
    ellipsis.set();

    this.ellipsis = ellipsis;
  }

  componentWillUnmount() {
    this.ellipsis.destroy();
  }

  render() {
    return (
      <div
        className="SurveyFormDesc"
        ref={(el) => {
          this.element = el;
        }}
      >
        <p>{this.props.children}</p>
      </div>
    );
  }
}

ListItemDescription.propTypes = {
  children: PropTypes.node,
};

ListItemDescription.defaultProps = {
  children: '',
};

export default ListItemDescription;
