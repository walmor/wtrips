import React from 'react';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { Avatar, Dropdown, Menu, Icon } from 'antd';
import MediaQuery from 'react-responsive';
import bp from '../../../core/mq-breakpoints';

const UserDropdown = ({ onSignOut, editProfile, username }) => {
  const menu = (
    <Menu className="UserDropdownMenu" selectedKeys={[]}>
      <Menu.Item onClick={editProfile}>
        <Icon type="setting" />
        My profile
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={onSignOut}>
        <Icon type="logout" />
        Sign out
      </Menu.Item>
    </Menu>
  );

  return (
    <span className="UserDropdown">
      <Dropdown overlay={menu}>
        <span>
          <Avatar className="Avatar" icon="user" size="small" />
          <MediaQuery minWidth={bp.sm.minWidth}>
            <span className="UserName">{username}</span>
          </MediaQuery>
        </span>
      </Dropdown>
    </span>
  );
};

UserDropdown.propTypes = {
  username: PropTypes.string.isRequired,
  onSignOut: PropTypes.func.isRequired,
  editProfile: PropTypes.func.isRequired,
};

function getFirstName(fullname) {
  let name = fullname;
  const firstSpaceIdx = fullname.indexOf(' ');
  if (firstSpaceIdx > 0) {
    name = fullname.substr(0, firstSpaceIdx);
  }
  return name;
}

function mapStateToProps(s) {
  const { auth } = s.appStore;
  return {
    username: getFirstName(auth.currentUser.name),
    onSignOut: () => auth.signOut(),
    editProfile: () => auth.editProfile(),
  };
}

export default inject(mapStateToProps)(UserDropdown);
