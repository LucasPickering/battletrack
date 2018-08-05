import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import actions from 'redux/actions';
import BtPropTypes from 'util/BtPropTypes';

import ApiDataComponent from 'components/ApiDataComponent';
import Match from 'components/match/Match';

import ApiView from './ApiView';

class MatchView extends ApiView {
  updateData() {
    const {
      id,
      fetchMatchIfNeeded,
    } = this.props;
    fetchMatchIfNeeded({ id });
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
  fetchMatchIfNeeded: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  matchState: state.api.match,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchMatchIfNeeded: actions.api.match.requestIfNeeded,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MatchView);
