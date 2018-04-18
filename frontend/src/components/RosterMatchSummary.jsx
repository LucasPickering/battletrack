import PropTypes from 'prop-types';
import React from 'react';
import { Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { formatSeconds, playerLink } from '../util';
import '../styles/RosterMatchSummary.css';

function makePlayerSummary(player) {
  const { player_id, name, stats } = player;
  return (
    <p key={player_id}>
      <Link to={playerLink(name)}>{name}</Link> - {stats.kills} kills - Survived {formatSeconds(stats.time_survived)}
    </p>
  );
}

const RosterMatchSummary = (props) => {
  const { data } = props;
  const { win_place, players } = data;

  return (
    <Panel className="player-match-summary">
      <Panel.Body>
        <h4>#{win_place}</h4>
        {players.map(makePlayerSummary)}
      </Panel.Body>
    </Panel>
  );
};

RosterMatchSummary.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default RosterMatchSummary;
