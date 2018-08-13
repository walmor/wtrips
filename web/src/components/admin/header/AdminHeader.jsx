import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Layout } from 'antd';
import MediaQuery from 'react-responsive';
import HeaderMenu from './HeaderMenu';
import HeaderLogo from './HeaderLogo';
import bp from '../../../core/mq-breakpoints';

const { Header } = Layout;

const AdminHeader = ({ onSiderTriggerClick, collapsed }) => (
  <Header className="AdminHeader u-clearFix">
    <MediaQuery maxWidth={bp.sm.maxWidth}>
      <HeaderLogo />
    </MediaQuery>
    <Icon
      className="SiderTrigger"
      type={collapsed ? 'menu-unfold' : 'menu-fold'}
      onClick={onSiderTriggerClick}
    />
    <HeaderMenu className="u-floatRight" />
  </Header>
);

AdminHeader.propTypes = {
  onSiderTriggerClick: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired,
};

export default AdminHeader;
