import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu, Icon } from 'antd';

// TODO: inject the currentRoute to get the selectedMenuKey
const SiderMenu = ({ onMenuItemClick, selectedMenuKey }) => (
  <Menu
    theme="dark"
    mode="inline"
    selectedKeys={[selectedMenuKey]}
    onClick={onMenuItemClick || undefined}
    className="SiderMenu"
  >
    <Menu.Item key="dashboard">
      <Link to="/admin/dashboard">
        <Icon type="dashboard" />
        <span>Dashboard</span>
      </Link>
    </Menu.Item>
    <Menu.Item key="users">
      <Link to="/admin/users">
        <Icon type="users" />
        <span>Users</span>
      </Link>
    </Menu.Item>
  </Menu>
);

SiderMenu.propTypes = {
  onMenuItemClick: PropTypes.func,
  selectedMenuKey: PropTypes.string,
};

SiderMenu.defaultProps = {
  onMenuItemClick: null,
  selectedMenuKey: null,
};

export default SiderMenu;
