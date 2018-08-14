import React from 'react';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';

const ContentHeader = ({ currentRoute }) => (
  <div className="ContentHeader">
    <Breadcrumb>
      {currentRoute.breadcrumbs.map(bc => (
        <Breadcrumb.Item key={bc.path}>
          <Link to={bc.path}>{bc.title}</Link>
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
    <h1 className="ContentTitle">{currentRoute.title}</h1>
  </div>
);

ContentHeader.propTypes = {
  currentRoute: PropTypes.object.isRequired,
};

function mapStateToProps(s) {
  return {
    currentRoute: s.appStore.currentRoute,
  };
}

export default inject(mapStateToProps)(ContentHeader);
