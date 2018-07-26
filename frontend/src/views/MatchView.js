import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { apiActions } from 'redux/api/apiActions';
import BtPropTypes from 'util/BtPropTypes';
import { isApiStateStale } from 'util/funcs';
import ApiDataComponent from 'components/ApiDataComponent';
import Match from 'components/match/Match';

import ApiView from './ApiView';

class MatchView extends ApiView {
  loadData() {
    const {
      id,
      match,
      fetchMatch,
    } = this.props;
    const newParams = { id };

    if (isApiStateStale(newParams, match)) {
      fetchMatch(newParams);
    }
  }

  render() {
    const { match } = this.props;
    return (
      <ApiDataComponent
        component={Match}
        states={{ match }}
        loadingText="Loading match..."
      />
    );
  }
}

MatchView.propTypes = {
  id: PropTypes.string.isRequired,
  match: BtPropTypes.apiState.isRequired,
  fetchMatch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  match: state.api.match,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchMatch: apiActions.match.request,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MatchView);
