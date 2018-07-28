import React from 'react';

import OverviewDrawer from 'components/overview/OverviewDrawer';
import OverviewMapContainer from 'components/overview/OverviewMapContainer';
import 'styles/overview/Overview.css';

class Overview extends React.PureComponent {
  constructor(...args) {
    super(...args);

    this.state = {
      drawerOpen: true,
    };
  }

  render() {
    const { drawerOpen } = this.state;
    return (
      <div className="overview">
        {drawerOpen && <OverviewDrawer />}
        <OverviewMapContainer
          drawerOpen={drawerOpen}
          onToggleDrawer={() => this.setState({ drawerOpen: !drawerOpen })}
        />
      </div>
    );
  }
}

export default Overview;
