import React from 'react';
import { Icon } from 'antd';
import ContentPanel from './content/ContentPanel';

const Users = () => (
  <ContentPanel>
    <div className="Dashboard">
      <h2>Users</h2>
      <Icon type="exclamation-circle-o" />
    </div>
  </ContentPanel>
);

export default Users;
