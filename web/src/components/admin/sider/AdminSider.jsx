import React from 'react';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import 'rc-drawer/assets/index.css';
import Drawer from 'rc-drawer';
import MediaQuery from 'react-responsive';
import SiderHeader from './SiderHeader';
import SiderMenu from './SiderMenu';
import bp from '../../../core/mq-breakpoints';

const { Sider } = Layout;

function mapStateToProps(s) {
  return {
    selectedMenuKey: s.appStore.currentRoute.menuKey,
  };
}

const AdminSider = inject(mapStateToProps)(({
  collapsed, onCollapse, onMenuItemClick, selectedMenuKey,
}) => (
  <Sider
    trigger={null}
    collapsible
    collapsed={collapsed}
    breakpoint="lg"
    onCollapse={onCollapse}
    width={256}
    className="AdminSider"
  >
    <SiderHeader />
    <SiderMenu onMenuItemClick={onMenuItemClick} selectedMenuKey={selectedMenuKey} />
  </Sider>
));

AdminSider.propTypes = {
  onMenuItemClick: PropTypes.func,
  onCollapse: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired,
};

AdminSider.defaultProps = {
  onMenuItemClick: null,
};

const ResponsiveSider = props => (
  <MediaQuery maxWidth={bp.sm.maxWidth}>
    {(match) => {
      if (match) {
        return (
          <Drawer
            parent={null}
            level={null}
            handler={false}
            iconChild={null}
            open={!props.collapsed}
            onMaskClick={() => props.onCollapse(true)}
            width="256px"
          >
            <AdminSider
              {...props}
              collapsed={false}
              onMenuItemClick={() => props.onCollapse(true)}
            />
          </Drawer>
        );
      }
      return <AdminSider {...props} />;
    }}
  </MediaQuery>
);

ResponsiveSider.propTypes = {
  onCollapse: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired,
};

export default ResponsiveSider;
