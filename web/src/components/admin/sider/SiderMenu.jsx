import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu, Icon } from 'antd';

const SiderMenu = ({ onMenuItemClick, selectedMenuKey, canManageUsers }) => (
  <Menu
    theme="dark"
    mode="inline"
    selectedKeys={[selectedMenuKey]}
    onClick={onMenuItemClick || undefined}
    className="SiderMenu"
  >
    <Menu.Item key="trips">
      <Link to="/admin/trips">
        <Icon type="global" />
        <span>Trips</span>
      </Link>
    </Menu.Item>
    <Menu.Item key="travelplan">
      <Link to="/admin/travelplan">
        <Icon type="calendar" />
        <span>Travel plan</span>
      </Link>
    </Menu.Item>
    {canManageUsers && (
      <Menu.Item key="users">
        <Link to="/admin/users">
          <Icon type="team" />
          <span>Users</span>
        </Link>
      </Menu.Item>
    )}
  </Menu>
);

SiderMenu.propTypes = {
  onMenuItemClick: PropTypes.func,
  selectedMenuKey: PropTypes.string,
  canManageUsers: PropTypes.bool,
};

SiderMenu.defaultProps = {
  onMenuItemClick: null,
  selectedMenuKey: null,
  canManageUsers: false,
};

export default SiderMenu;
