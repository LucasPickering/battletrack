import PropTypes from 'prop-types';
import React from 'react';
import { Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { formatSeconds } from 'util/formatters';
import { playerLink } from 'util/links';
import 'styles/match/RosterMatchSummary.css';

const RosterMatchSummary = props => {
  const { shard, data, ...rest } = props;
  const { win_place: winPlace, players } = data;

  return (
    <Panel className="roster-match-summary" {...rest}>
      <p className="placement">#{winPlace}</p>
      <table className="roster-table">
        <thead>
          <tr>
            <th style={{ width: 180 }} />
            <th>Kills</th>
            <th>Time Alive</th>
          </tr>
        </thead>
        <tbody>
          {players.map(({ player_id: id, player_name: name, stats }) => (
            <tr key={id}>
              <td><Link to={playerLink(shard, name)}>{name}</Link></td>
              <td>{stats.kills}</td>
              <td>{formatSeconds(stats.time_survived)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
};

RosterMatchSummary.propTypes = {
  shard: PropTypes.string.isRequired,
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default RosterMatchSummary;
