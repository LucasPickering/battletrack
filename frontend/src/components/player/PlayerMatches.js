import React from 'react';
import { ListGroup } from 'react-bootstrap';

import BtPropTypes from 'util/BtPropTypes';
import PlayerMatchSummary from './PlayerMatchSummary';
import 'styles/player/PlayerMatches.css';

const PlayerMatches = ({ data }) => (
  <ListGroup className="player-matches">
    {data.matches
      .filter(m => m.summary) // Filter out null matches
      .map(m => (
        <PlayerMatchSummary
          key={m.match_id}
          playerName={data.name}
          data={m}
        />
      ))}
  </ListGroup>
);

PlayerMatches.propTypes = {
  data: BtPropTypes.player.isRequired,
};

export default PlayerMatches;
