import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ListGroup } from 'react-bootstrap';

import BtPropTypes from 'util/BtPropTypes';
import PlayerMatchSummary from './PlayerMatchSummary';
import 'styles/player/PlayerMatches.css';

function filterPasses(filter, val) {
  return !filter || filter === val;
}

function filterMatches(filters, matches) {
  return matches
    .filter(m => m.summary) // Filter out null matches
    .filter(m => filterPasses(filters.mode, m.summary.mode)) // Filter by mode
    .filter(m => filterPasses(filters.perspective, m.summary.perspective)); // Filter by perspective
}

const PlayerMatches = ({
  player: {
    name,
    matches,
  },
  filters,
}) => {
  const filteredMatches = filterMatches(filters, matches);
  return (
    <div className="player-matches-container">
      <p className="player-match-count">{filteredMatches.length} matches</p>
      <ListGroup className="player-matches">
        {filteredMatches
          .map(m => (
            <PlayerMatchSummary
              key={m.match_id}
              playerName={name}
              match={m}
            />
          ))}
      </ListGroup>
    </div>
  );
};

PlayerMatches.propTypes = {
  player: BtPropTypes.player.isRequired,
  filters: PropTypes.objectOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  player: state.api.player.data,
});

export default connect(mapStateToProps)(PlayerMatches);
