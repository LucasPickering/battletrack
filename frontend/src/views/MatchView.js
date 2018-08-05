import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import actions from 'redux/actions';
import { isStateStale } from 'redux/api/apiSelectors';
import BtPropTypes from 'util/BtPropTypes';

import ApiDataComponent from 'components/ApiDataComponent';
import Match from 'components/match/Match';

import ApiView from './ApiView';

class MatchView extends ApiView {
  updateData() {
    const {
      id,
      matchState,
      fetchMatch,
    } = this.props;
    const newParams = { id };

    if (isStateStale(matchState, newParams)) {
      fetchMatch(newParams);
    }
  }

  render() {
    const { matchState } = this.props;
    return (
      <ApiDataComponent
        component={Match}
        state={matchState}
        loadingText="Loading match..."
      />
    );
  }
}

MatchView.propTypes = {
  id: PropTypes.string.isRequired,
  matchState: BtPropTypes.apiState.isRequired,
  fetchMatch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  matchState: state.api.match,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchMatch: actions.api.match.request,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MatchView);
