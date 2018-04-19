import PropTypes from 'prop-types';
import React from 'react';
import { Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { formatSeconds, playerLink } from '../util';
import '../styles/RosterMatchSummary.css';

function makePlayerSummary(player) {
  const { player_id, name, stats } = player;
  return (
    <tr key={player_id}>
      <td><Link to={playerLink(name)}>{name}</Link></td>
      <td>{stats.kills}</td>
      <td>{formatSeconds(stats.time_survived)}</td>
    </tr>
  );
}

const RosterMatchSummary = (props) => {
  const { data } = props;
  const { win_place, players } = data;

  return (
    <Panel className="roster-match-summary">
      <Panel.Body>
        <h4>#{win_place}</h4>
        <table className="roster-table">
          <thead>
            <tr>
              <th></th>
              <th>Kills</th>
              <th>Time Alive</th>
            </tr>
          </thead>
          <tbody>
            {players.map(makePlayerSummary)}
          </tbody>
        </table>
      </Panel.Body>
    </Panel>
  );
};

RosterMatchSummary.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default RosterMatchSummary;
