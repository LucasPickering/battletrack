import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import BtPropTypes from 'util/BtPropTypes';
import { formatDate } from 'util/formatters';
import {
  matchLink,
  playerLink,
} from 'util/links';
import Localization from 'util/Localization';

import MatchPlacement from 'components/MatchPlacement';
import ModePerspective from 'components/ModePerspective';
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
      roster_count: rosterCount,
    },
    roster,
    stats,
  } = match;
  const rosterNames = roster.map(player => player.player_name);

  return (
    <Panel className="player-match-summary">
      <Panel.Heading>
        <Panel.Title>
          <ModePerspective mode={mode} perspective={perspective} />
        </Panel.Title>
        <Panel.Title style={{ textAlign: 'right' }}>
          {formatDate(date)}
        </Panel.Title>
        <Panel.Title>{Localization.maps[mapName]}</Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        <MatchPlacement
          winPlace={stats.win_place}
          rosterCount={rosterCount}
          link={matchLink(matchId)}
        />
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
