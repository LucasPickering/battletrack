import PropTypes from 'prop-types';
import React from 'react';
import { Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import 'styles/PlayerMatchSummary.css';
import {
  formatDate,
  formatSeconds,
  formatGameMode,
  formatPerspective,
  matchLink,
  playerLink,
} from 'util/funcs';
import Localization from 'util/Localization';
import Stat from './Stat';

const PlayerMatchSummary = props => {
  const { playerName, data } = props;
  const {
    match_id: matchId,
    match: {
      mode,
      perspective,
      map_name: mapName,
      date,
    },
    roster,
    stats,
  } = data;
  const travelDistance = (stats.walk_distance + stats.ride_distance) / 1000; // Convert to km
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
