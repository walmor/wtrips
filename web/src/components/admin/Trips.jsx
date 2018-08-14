import React from 'react';
import { Icon } from 'antd';
import ContentPanel from './content/ContentPanel';

const Trips = () => (
  <ContentPanel>
    <div className="Dashboard">
      <h2>Trips</h2>
      <Icon type="exclamation-circle-o" />
    </div>
  </ContentPanel>
);

export default Trips;
