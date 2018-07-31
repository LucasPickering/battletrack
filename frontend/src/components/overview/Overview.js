import React from 'react';

import OverviewDrawer from 'components/overview/OverviewDrawer';
import OverviewMapContainer from 'components/overview/OverviewMapContainer';
import 'styles/overview/Overview.css';

const Overview = () => (
  <div className="overview">
    <OverviewDrawer />
    <OverviewMapContainer />
  </div>
);

export default Overview;
