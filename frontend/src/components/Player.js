import PropTypes from 'prop-types';
import React from 'react';
import { ListGroup } from 'react-bootstrap';

import { playerLink } from '../util/funcs';
import ApiComponent from './ApiComponent';
import PlayerMatchSummary from './PlayerMatchSummary';
import ShardSelect from './ShardSelect';
import '../styles/Player.css';

const PlayerMatches = ({ playerData }) => (
  <ListGroup className="matches">
    {playerData.matches
      .filter(m => m.summary) // Filter out null matches
      .map(m => (
        <PlayerMatchSummary
          key={m.match_id}
          playerName={playerData.name}
          data={m}
        />
      ))}
  </ListGroup>
);

PlayerMatches.propTypes = {
  playerData: PropTypes.objectOf(PropTypes.any).isRequired,
};

const Player = ({ shard, playerName, history }) => (
  <div className="player">
    <div className="header">
      <h2>{playerName}</h2>
      <ShardSelect
        activeShard={shard}
        onSelect={newShard => history.push(playerLink(newShard, playerName))}
      />
    </div>
    <ApiComponent
      url={`/api/core/players/${shard}/${playerName}?popMatches`}
      component={PlayerMatches}
      dataProp="playerData"
      loaderText="Loading matches..."
    />
  </div>
);

Player.propTypes = {
  shard: PropTypes.string.isRequired,
  playerName: PropTypes.string.isRequired,
  history: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Player;