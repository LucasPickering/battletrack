import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import actions from 'redux/actions';
import { isStateStale } from 'redux/api/apiSelectors';
import { isOverviewStale } from 'redux/overview/overviewSelectors';
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
      telemetryState,
      overviewData,
      fetchMatch,
      fetchTelemetry,
      initMatch,
    } = this.props;
    const newParams = { id };

    if (isStateStale(matchState, newParams)) {
      fetchMatch(newParams);
    }
    if (isStateStale(telemetryState, newParams)) {
      fetchTelemetry(newParams);
    }

    // If we have match data and the overview match ID is outdated, init overview
    if (matchState.data && isOverviewStale(overviewData, matchState.data.id)) {
      initMatch(matchState.data);
    }
  }

  render() {
    const {
      id,
      matchState,
      overviewData,
    } = this.props;

    return (
      <ApiDataComponent
        component={Overview}
        state={matchState}
        loadingText="Loading match..."
        isLoading={stateLoading => stateLoading || isOverviewStale(overviewData, id)}
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
  overviewData: PropTypes.shape({ // TODO: Remove need for entire object
    matchId: PropTypes.string,
    rosterPalette: BtPropTypes.rosterPalette,
  }),

  // Redux dispatches
  fetchMatch: PropTypes.func.isRequired,
  fetchTelemetry: PropTypes.func.isRequired,
  initMatch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  matchState: state.api.match,
  telemetryState: state.api.telemetry,
  overviewData: state.overview,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchMatch: actions.api.match.request,
  fetchTelemetry: actions.api.telemetry.request,
  initMatch: actions.overview.initMatch,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(OverviewView);
