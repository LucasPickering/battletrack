import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import actions from 'redux/actions';
import { shouldInitOverview } from 'redux/overview/overviewSelectors';
import BtPropTypes from 'util/BtPropTypes';

import ApiDataComponent from 'components/ApiDataComponent';
import Overview from 'components/overview/Overview';

import ApiView from './ApiView';

class OverviewView extends ApiView {
  constructor(...args) {
    super(...args);

    this.state = {
      drawerOpen: true,
    };
  }

  updateData() {
    const {
      id,
      matchState,
      shouldInitOverviewProp,
      fetchMatchIfNeeded,
      fetchTelemetryIfNeeded,
      initMatch,
    } = this.props;
    const newParams = { id };

    fetchMatchIfNeeded(newParams);
    fetchTelemetryIfNeeded(newParams);

    // If we have match data and the overview data is outdated, init overview now
    if (shouldInitOverviewProp) {
      initMatch(matchState.data);
    }
  }

  render() {
    const {
      matchState,
      shouldInitOverviewProp,
    } = this.props;

    return (
      <ApiDataComponent
        component={Overview}
        state={matchState}
        loadingText="Loading match..."
        isLoading={stateLoading => stateLoading || shouldInitOverviewProp}
      />
    );
  }
}

OverviewView.propTypes = {
  // URL params
  id: PropTypes.string.isRequired, // Match ID

  // Redux state
  matchState: BtPropTypes.apiState.isRequired,
  telemetryState: BtPropTypes.apiState.isRequired,
  shouldInitOverviewProp: PropTypes.bool.isRequired,

  // Redux dispatches
  fetchMatchIfNeeded: PropTypes.func.isRequired,
  fetchTelemetryIfNeeded: PropTypes.func.isRequired,
  initMatch: PropTypes.func.isRequired,
};

OverviewView.defaultProps = {
  overviewMatchId: null,
};

const mapStateToProps = state => ({
  matchState: state.api.match,
  telemetryState: state.api.telemetry,
  shouldInitOverviewProp: shouldInitOverview(state), // Add "Prop" to avoid name collision
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchMatchIfNeeded: actions.api.match.requestIfNeeded,
  fetchTelemetryIfNeeded: actions.api.telemetry.requestIfNeeded,
  initMatch: actions.overview.initMatch,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(OverviewView);
