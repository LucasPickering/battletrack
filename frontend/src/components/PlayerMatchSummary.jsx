import PropTypes from 'prop-types';
import React from 'react';
import { Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { formatSeconds, matchLink, translateGameMode, translateMap } from '../util';
import '../styles/PlayerMatchSummary.css';

const PlayerMatchSummary = (props) => {
  const { data } = props;
  const { match_id, match, stats } = data;
  const travelDistance = (stats.walk_distance + stats.ride_distance) / 1000; // Convert to km

  return (
    <Link to={matchLink(match_id)}>
      <Panel className="player-match-summary">
        <Panel.Heading>
          <Panel.Title componentClass="h3">{translateGameMode(match.mode)}</Panel.Title>
          <Panel.Title componentClass="h3">{translateMap(match.map_name)}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <ul className="left-block">
            <li>#{stats.win_place}</li>
            <li>{stats.kills} kills</li>
          </ul>
          <ul className="right-block">
            <li>Survived {formatSeconds(stats.time_survived)}</li>
            <li>Traveled {travelDistance.toFixed(2)} km</li>
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
