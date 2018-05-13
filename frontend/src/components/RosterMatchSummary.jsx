import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { formatSeconds, playerLink } from '../util';
import '../styles/RosterMatchSummary.css';

class RosterMatchSummary extends Component {
  constructor(props, context) {
    super(props, context);
    this.makePlayerSummary = this.makePlayerSummary.bind(this);
  }

  makePlayerSummary(player) {
    const { shard } = this.props;
    const { player_id: id, player_name: name, stats } = player;
    return (
      <tr key={id}>
        <td><Link to={playerLink(shard, name)}>{name}</Link></td>
        <td>{stats.kills}</td>
        <td>{formatSeconds(stats.time_survived)}</td>
      </tr>
    );
  }

  render() {
    const { data } = this.props;
    const { win_place: winPlace, players } = data;

    return (
      <Panel className="roster-match-summary">
        <Panel.Body>
          <h4>#{winPlace}</h4>
          <table className="roster-table">
            <thead>
              <tr>
                <th>Kills</th>
                <th>Time Alive</th>
              </tr>
            </thead>
            <tbody>
              {players.map(this.makePlayerSummary)}
            </tbody>
          </table>
        </Panel.Body>
      </Panel>
    );
  }
}

RosterMatchSummary.propTypes = {
  shard: PropTypes.string.isRequired,
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default RosterMatchSummary;
