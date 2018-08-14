import React from 'react';
import { Icon } from 'antd';
import ContentPanel from './content/ContentPanel';

const TravelPlan = () => (
  <ContentPanel>
    <div className="Dashboard">
      <h2>Travel plan</h2>
      <Icon type="exclamation-circle-o" />
    </div>
  </ContentPanel>
);

export default TravelPlan;
