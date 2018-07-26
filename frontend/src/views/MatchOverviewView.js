import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { apiActions } from 'redux/api/apiActions';
import BtPropTypes from 'util/BtPropTypes';
import { isApiStateStale } from 'util/funcs';
import ApiDataComponent from 'components/ApiDataComponent';
import MatchOverview from 'components/match/MatchOverview';

import ApiView from './ApiView';

class MatchOverviewView extends ApiView {
  loadData() {
    const {
      id,
      match,
      telemetry,
      fetchMatch,
      fetchTelemetry,
    } = this.props;
    const newParams = { id };

    if (isApiStateStale(newParams, match)) {
      fetchMatch(newParams);
    }
    if (isApiStateStale(newParams, telemetry)) {
      fetchTelemetry(newParams);
    }
  }

  render() {
    const { match, telemetry } = this.props;
    return (
      <ApiDataComponent
        component={MatchOverview}
        states={{ match, telemetry }}
        loadingText="Loading match data..."
      />
    );
  }
}

MatchOverviewView.propTypes = {
  id: PropTypes.string.isRequired,
  match: BtPropTypes.apiState.isRequired,
  telemetry: BtPropTypes.apiState.isRequired,
  fetchMatch: PropTypes.func.isRequired,
  fetchTelemetry: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  match: state.api.match,
  telemetry: state.api.telemetry,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchMatch: apiActions.match.request,
  fetchTelemetry: apiActions.telemetry.request,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MatchOverviewView);
