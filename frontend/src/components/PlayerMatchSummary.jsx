import PropTypes from 'prop-types';
import React from 'react';
import { Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import {
  formatDate,
  formatSeconds,
  formatGameMode,
  formatPerspective,
  matchLink,
  playerLink,
} from '../util/funcs';
import Stat from './Stat';
import '../styles/PlayerMatchSummary.css';

const PlayerMatchSummary = props => {
  const { playerName, data } = props;
  const {
    match_id: matchId,
    match,
    roster,
    stats,
  } = data;
  const travelDistance = (stats.walk_distance + stats.ride_distance) / 1000; // Convert to km
  const rosterNames = roster.map(player => player.player_name);

  return (
    <Panel className="player-match-summary">
      <Panel.Heading>
        <Panel.Title>
          {formatGameMode(match.mode)} {formatPerspective(match.perspective)}
        </Panel.Title>
        <Panel.Title style={{ textAlign: 'right' }}>
          {formatDate(match.date)}
        </Panel.Title>
        <Panel.Title>{match.map_name}</Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        <Link className="placement" to={matchLink(matchId)}>#{stats.win_place}</Link>
        <Stat className="kills" title="Kills" stats={[stats.kills]} />
        <Stat
          className="damage"
          title="Damage"
          stats={[stats.damage_dealt]}
          formatter={d => d.toFixed(0)}
        />
        <Stat
          className="survived"
          title="Survived"
          stats={[stats.time_survived]}
          formatter={formatSeconds}
        />
        <Stat
          className="traveled"
          title="Traveled"
          stats={[travelDistance]}
          formatter={dist => `${dist.toFixed(2)} km`}
        />
        <ul className="roster">
          {rosterNames.map(name => (
            <li key={name}>
              {name === playerName
                ? <b>{name}</b>
                : <Link to={playerLink(data.shard, name)}>{name}</Link>}
            </li>
          ))}
        </ul>
      </Panel.Body>
    </Panel>
  );
};

PlayerMatchSummary.propTypes = {
  playerName: PropTypes.string.isRequired,
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default PlayerMatchSummary;
