import PropTypes from 'prop-types';
import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { connect } from 'react-redux';

import DataPropTypes from 'proptypes/DataPropTypes';
import MatchSummary from './match/MatchSummary';

const RecentMatches = ({ matches }) => (
  <ListGroup>
    {matches.map(m => (
      <MatchSummary key={m.match_id} match={m} />
    ))}
  </ListGroup>
);

RecentMatches.propTypes = {
  matches: PropTypes.arrayOf(DataPropTypes.match.isRequired).isRequired,
};

const mapStateToProps = state => ({
  matches: state.api.recentMatches.data,
});

export default connect(mapStateToProps)(RecentMatches);
