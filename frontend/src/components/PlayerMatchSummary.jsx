import PropTypes from 'prop-types';
import React from 'react';
import { Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import {
  formatDate,
  formatSeconds,
  formatGameMode,
  formatPerspective,
  formatMap,
  matchLink,
} from '../util';
import '../styles/PlayerMatchSummary.css';

const PlayerMatchSummary = (props) => {
  const { data } = props;
  const { match_id, match, roster, stats } = data;
  const travelDistance = (stats.walk_distance + stats.ride_distance) / 1000; // Convert to km
  const rosterNames = roster.map(player => player.player_name);

  return (
    <Link to={matchLink(match_id)}>
      <Panel className="player-match-summary">
        <Panel.Heading>
          <Panel.Title>
            {formatGameMode(match.mode)} {formatPerspective(match.perspective)}
          </Panel.Title>
          <Panel.Title style={{'textAlign': 'right'}}>
            {formatDate(match.date, 'MMMM D, HH:mm')}
          </Panel.Title>
          <Panel.Title>{formatMap(match.map_name)}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <h3 className="placement">#{stats.win_place}</h3>
          <ul className="stats1">
            <li>{stats.kills} kills</li>
          </ul>
          <ul className="stats2">
            <li>Survived {formatSeconds(stats.time_survived)}</li>
            <li>Traveled {travelDistance.toFixed(2)} km</li>
          </ul>
          <ul className="roster">
            {rosterNames.map(name => <li key={name}>{name}</li>)}
          </ul>
        </Panel.Body>
      </Panel>
    </Link>
  );
};

PlayerMatchSummary.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default PlayerMatchSummary;
