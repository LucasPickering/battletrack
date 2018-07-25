import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Actions } from 'redux/actions';

import ApiComponent from '../ApiComponent2';
import ApiStatusComponent from '../ApiStatusComponent';
import MatchDisplay from './MatchDisplay';
import 'styles/match/Match.css';

class Match extends ApiComponent {
  constructor(props, context) {
    super(props, context, props.fetchMatch, 'match', ['id']);
  }

  render() {
    const { match } = this.props;
    return (
      <ApiStatusComponent
        component={MatchDisplay}
        status={match}
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
  match: state.match,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchMatch: Actions.match.request,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Match);
