import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Dropdown, Menu, Icon } from 'antd';
import MediaQuery from 'react-responsive';
import bp from '../../../core/mq-breakpoints';
// import authManager from '../../../core/auth-manager';

const UserDropdown = (props) => {
  const menu = (
    <Menu className="UserDropdownMenu" selectedKeys={[]}>
      <Menu.Item disabled>
        <Icon type="setting" />My account
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={props.onSignOut}>
        <Icon type="logout" />Sign out
      </Menu.Item>
    </Menu>
  );

  return (
    <span className="UserDropdown">
      <Dropdown overlay={menu}>
        <span>
          <Avatar className="Avatar" icon={props.loading ? 'loading' : 'user'} size="small" />
          <MediaQuery minWidth={bp.sm.minWidth}>
            {!props.error && (
              <span className="UserName">{props.loading ? 'Loading...' : props.username}</span>
            )}
          </MediaQuery>
        </span>
      </Dropdown>
    </span>
  );
};

UserDropdown.propTypes = {
  username: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.bool,
  onSignOut: PropTypes.func.isRequired,
};

UserDropdown.defaultProps = {
  username: null,
  loading: false,
  error: false,
};

// function getUsername(data) {
//   if (!data || !data.viewer) {
//     return null;
//   }

//   let { name } = data.viewer;
//   const firstSpaceIdx = name.indexOf(' ');
//   if (firstSpaceIdx > 0) {
//     name = name.substr(0, firstSpaceIdx);
//   }
//   return name;
// }

export default UserDropdown;
