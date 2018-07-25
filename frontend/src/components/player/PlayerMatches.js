import React from 'react';
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
          data={m}
        />
      ))}
  </ListGroup>
);

PlayerMatches.propTypes = {
  player: BtPropTypes.player.isRequired,
};

export default PlayerMatches;
