import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import { Switch, Route, Redirect } from 'react-router-dom';
import AdminHeader from '../components/admin/header/AdminHeader';
import AdminFooter from '../components/admin/footer/AdminFooter';
import AdminSider from '../components/admin/sider/AdminSider';
import ContentHeader from '../components/admin/content/ContentHeader';
import Dashboard from '../components/admin/Dashboard';
import { getCurrentRoute } from '../core/routes';

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
    const route = getCurrentRoute(match.url);
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
              <ContentHeader title="Forms" currentRoute={route} />
              <Switch>
                {/* <Route path={`${match.url}/forms/new`} component={CreateSurveyForm} />
                <Route path={`${match.url}/forms/:formId`} component={EditSurveyForm} />
                <Route path={`${match.url}/forms`} component={SurveyForms} /> */}
                <Route path={`${match.url}/dashboard`} component={Dashboard} />
                <Redirect to="/admin/dashboard" />
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
