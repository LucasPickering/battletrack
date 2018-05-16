import PropTypes from 'prop-types';
import React from 'react';
import { ListGroup } from 'react-bootstrap';

import {
  playerLink,
  sortKeyFunc,
} from '../util';
import ApiComponent from './ApiComponent';
import PlayerMatchSummary from './PlayerMatchSummary';
import ShardSelect from './ShardSelect';
import '../styles/Player.css';

function renderMatches(playerData) {
  return (
    <ListGroup className="matches">
      {playerData.matches
        .filter(m => m.match) // Filter out null matches
        .sort(sortKeyFunc(m => m.match.date, true)) // Sort by date
        .map(m => (
          <PlayerMatchSummary
            key={m.match_id}
            playerName={playerData.name}
            data={m}
          />
        ))}
    </ListGroup>
  );
}

const Player = props => {
  const { history, match: { params: { shard, playerName } } } = props;

  return (
    <div className="player">
      <h2>{playerName}</h2>
      <ShardSelect
        value={shard}
        onChange={e => history.push(playerLink(e.target.value, playerName))}
      />
      <ApiComponent
        url={`/api/core/players/${shard}/${playerName}?popMatches`}
        render={renderMatches}
      />
    </div>
  );
};

Player.propTypes = {
  history: PropTypes.objectOf(PropTypes.any).isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Player;
