import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ApiDataComponent from 'components/ApiDataComponent';
import Match from 'components/match/Match';
import actions from 'redux/actions';
import BtPropTypes from 'util/BtPropTypes';
import { isApiStateStale } from 'util/funcs';

import ApiView from './ApiView';

class MatchView extends ApiView {
  loadData() {
    const {
      id,
      matchState,
      fetchMatch,
    } = this.props;
    const newParams = { id };

    if (isApiStateStale(newParams, matchState)) {
      fetchMatch(newParams);
    }
  }

  render() {
    const { matchState } = this.props;
    return (
      <ApiDataComponent
        component={Match}
        states={{ match: matchState }}
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
