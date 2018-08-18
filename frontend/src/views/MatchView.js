import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ApiPropTypes from 'proptypes/ApiPropTypes';
import actions from 'redux/actions';

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
  matchState: ApiPropTypes.apiState.isRequired,
  fetchMatchIfNeeded: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  matchState: state.api.match,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchMatchIfNeeded: actions.api.match.requestIfNeeded,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MatchView);
