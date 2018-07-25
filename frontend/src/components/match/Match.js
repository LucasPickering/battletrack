import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { apiActions } from 'redux/api/apiActions';
import { isApiStateStale } from 'util/funcs';

import ApiComponent from '../ApiComponent2';
import ApiDataComponent from '../ApiDataComponent';
import MatchDisplay from './MatchDisplay';
import 'styles/match/Match.css';

class Match extends ApiComponent {
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
        component={MatchDisplay}
        states={{ match }}
        loadingText="Loading match..."
      />
    );
  }
}

Match.propTypes = {
  id: PropTypes.string.isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  fetchMatch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  match: state.api.match,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchMatch: apiActions.match.request,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Match);
