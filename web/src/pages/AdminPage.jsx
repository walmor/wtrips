import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import { Switch, Route, Redirect } from 'react-router-dom';
import AdminHeader from '../components/admin/header/AdminHeader';
import AdminFooter from '../components/admin/footer/AdminFooter';
import AdminSider from '../components/admin/sider/AdminSider';
import ContentHeader from '../components/admin/content/ContentHeader';
import Trips from '../components/admin/Trips';
import TravelPlan from '../components/admin/TravelPlan';
import Users from '../components/admin/Users';

const { Content } = Layout;

const propTypes = {
  match: PropTypes.shape({ url: PropTypes.string }).isRequired,
};

class AdminPage extends React.Component {
  constructor() {
    super();
    this.state = {
      menuCollapsed: false,
    };
  }

  onSiderCollapse = (collapsed) => {
    this.setState({
      menuCollapsed: collapsed,
    });
  };

  toggleSider = () => {
    this.setState(state => ({
      menuCollapsed: !state.menuCollapsed,
    }));
  };

  render() {
    const { match } = this.props;
    return (
      <div>
        <Layout>
          <AdminSider collapsed={this.state.menuCollapsed} onCollapse={this.onSiderCollapse} />
          <Layout>
            <AdminHeader
              onSiderTriggerClick={this.toggleSider}
              collapsed={this.state.menuCollapsed}
            />
            <Content id="content" className="Content">
              <ContentHeader title="Trips" />
              <Switch>
                <Route path={`${match.url}/users`} component={Users} />
                <Route path={`${match.url}/travelplan`} component={TravelPlan} />
                <Route path={`${match.url}/trips`} component={Trips} />
                <Redirect to={`${match.url}/trips`} />
              </Switch>
            </Content>
            <AdminFooter />
          </Layout>
        </Layout>
      </div>
    );
  }
}

AdminPage.propTypes = propTypes;

export default AdminPage;
