import React from 'react';
import { connect } from 'react-redux';

import ApiPropTypes from 'proptypes/ApiPropTypes';

import ApiDataComponent from 'components/ApiDataComponent';
import 'styles/overview/OverviewMapContainer.css';

import OverviewTimeRange from './OverviewTimeRange';
import OverviewMap from './OverviewMap';

class OverviewMapContainer extends React.PureComponent {
  render() {
    const {
      telemetryState,
    } = this.props;

    return (
      <div className="overview-map-container">
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
  // Redux state
  telemetryState: ApiPropTypes.apiState.isRequired,
};

const mapStateToProps = state => ({
  telemetryState: state.api.telemetry,
});

export default connect(mapStateToProps)(OverviewMapContainer);
