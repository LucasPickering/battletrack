import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ApiDataComponent from 'components/ApiDataComponent';
import MatchOverview from 'components/match/MatchOverview';
import actions from 'redux/actions';
import BtPropTypes from 'util/BtPropTypes';
import { isApiStateStale } from 'util/funcs';

import ApiView from './ApiView';

class MatchOverviewView extends ApiView {
  loadData() {
    const {
      id,
      matchState,
      telemetryState,
      fetchMatch,
      fetchTelemetry,
    } = this.props;
    const newParams = { id };

    if (isApiStateStale(newParams, matchState)) {
      fetchMatch(newParams);
    }
    if (isApiStateStale(newParams, telemetryState)) {
      fetchTelemetry(newParams);
    }
  }

  render() {
    const { matchState, telemetryState } = this.props;
    return (
      <ApiDataComponent
        component={MatchOverview}
        states={{ match: matchState, telemetry: telemetryState }}
        loadingText="Loading match data..."
      />
    );
  }
}

MatchOverviewView.propTypes = {
  id: PropTypes.string.isRequired,
  matchState: BtPropTypes.apiState.isRequired,
  telemetryState: BtPropTypes.apiState.isRequired,
  fetchMatch: PropTypes.func.isRequired,
  fetchTelemetry: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  matchState: state.api.match,
  telemetryState: state.api.telemetry,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchMatch: actions.api.match.request,
  fetchTelemetry: actions.api.telemetry.request,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MatchOverviewView);
