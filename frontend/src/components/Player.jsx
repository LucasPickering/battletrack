import PropTypes from 'prop-types';
import React from 'react';
import { ListGroup } from 'react-bootstrap';

import { playerLink } from '../util/funcs';
import ApiComponent from './ApiComponent';
import PlayerSearch from './PlayerSearch';
import PlayerMatchSummary from './PlayerMatchSummary';
import ShardSelect from './ShardSelect';
import '../styles/Player.css';

const PlayerMatches = ({ playerData }) => (
  <ListGroup className="matches">
    {playerData.matches
      .filter(m => m.match) // Filter out null matches
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
  <div>
    <PlayerSearch />
    <div className="player">
      <h2>{playerName}</h2>
      <ShardSelect
        value={shard}
        onChange={e => history.push(playerLink(e.target.value, playerName))}
      />
      <ApiComponent
        url={`/api/core/players/${shard}/${playerName}?popMatches`}
        component={PlayerMatches}
        dataProp="playerData"
      />
    </div>
  </div>
);

Player.propTypes = {
  shard: PropTypes.string.isRequired,
  playerName: PropTypes.string.isRequired,
  history: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Player;
