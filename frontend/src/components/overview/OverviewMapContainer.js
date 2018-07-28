import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';

import BtPropTypes from 'util/BtPropTypes';

import ApiDataComponent from 'components/ApiDataComponent';
import Icon from 'components/Icon';
import 'styles/overview/OverviewMapContainer.css';

import OverviewTimeRange from './OverviewTimeRange';
import OverviewMap from './OverviewMap';

class OverviewMapContainer extends React.PureComponent {
  render() {
    const {
      drawerOpen,
      onToggleDrawer,
      telemetryState,
    } = this.props;

    return (
      <div className="overview-map-container">
        <Button
          className="drawer-button"
          onClick={onToggleDrawer}
        >
          <Icon name={drawerOpen ? 'chevron-left' : 'chevron-right'} />
        </Button>

        <OverviewTimeRange />

        <ApiDataComponent
          component={OverviewMap}
          state={telemetryState}
          loadingText="Loading match data..."
        />
      </div>
    );
  }
}

OverviewMapContainer.propTypes = {
  drawerOpen: PropTypes.bool.isRequired,
  onToggleDrawer: PropTypes.func,
  // Redux state
  telemetryState: BtPropTypes.apiState.isRequired,
};

OverviewMapContainer.defaultProps = {
  onToggleDrawer: () => {},
};

const mapStateToProps = state => ({
  telemetryState: state.api.telemetry,
});

export default connect(mapStateToProps)(OverviewMapContainer);
