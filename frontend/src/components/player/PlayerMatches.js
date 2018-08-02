import React from 'react';
import { connect } from 'react-redux';
import { ListGroup } from 'react-bootstrap';

import BtPropTypes from 'util/BtPropTypes';
import PlayerMatchSummary from './PlayerMatchSummary';
import 'styles/player/PlayerMatches.css';

const PlayerMatches = ({
  player: {
    name,
    matches,
  },
}) => (
  <ListGroup className="player-matches">
    {matches
      .filter(m => m.summary) // Filter out null matches
      .map(m => (
        <PlayerMatchSummary
          key={m.match_id}
          playerName={name}
          match={m}
        />
      ))}
  </ListGroup>
);

PlayerMatches.propTypes = {
  player: BtPropTypes.player.isRequired,
};

const mapStateToProps = state => ({
  player: state.api.player.data,
});

export default connect(mapStateToProps)(PlayerMatches);
