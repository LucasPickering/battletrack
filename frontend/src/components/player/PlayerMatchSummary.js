import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import BtPropTypes from 'util/BtPropTypes';
import {
  formatDate,
  formatGameMode,
  formatPerspective,
  matchLink,
  playerLink,
} from 'util/funcs';
import Localization from 'util/Localization';

import 'styles/player/PlayerMatchSummary.css';

import PlayerMatchStats from './PlayerMatchStats';

const PlayerMatchSummary = props => {
  const {
    playerName,
    match,
  } = props;
  const {
    match_id: matchId,
    summary: {
      mode,
      perspective,
      map_name: mapName,
      date,
      shard,
    },
    roster,
    stats,
  } = match;
  const rosterNames = roster.map(player => player.player_name);

  return (
    <Panel className="player-match-summary">
      <Panel.Heading>
        <Panel.Title>
          {formatGameMode(mode)} {formatPerspective(perspective)}
        </Panel.Title>
        <Panel.Title style={{ textAlign: 'right' }}>
          {formatDate(date)}
        </Panel.Title>
        <Panel.Title>{Localization.maps[mapName]}</Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        <Link className="placement" to={matchLink(matchId)}>#{stats.win_place}</Link>
        <PlayerMatchStats stats={stats} />
        <ul className="roster">
          {rosterNames.map(name => (
            <li key={name}>
              {
                // Style this player's name different from the rest
                name === playerName
                  ? <b>{name}</b>
                  : <Link to={playerLink(shard, name)}>{name}</Link>
              }
            </li>
          ))}
        </ul>
      </Panel.Body>
    </Panel>
  );
};

PlayerMatchSummary.propTypes = {
  playerName: PropTypes.string.isRequired,
  match: BtPropTypes.playerMatch.isRequired,
};

export default PlayerMatchSummary;
