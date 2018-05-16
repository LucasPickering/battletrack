import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import {
  formatDate,
  formatSeconds,
  matchLink,
  playerLink,
} from '../util';
import Stat from './Stat';
import '../styles/PlayerMatchSummary.css';

class PlayerMatchSummary extends Component {
  constructor(props, context) {
    super(props, context);
    this.renderPlayerName = this.renderPlayerName.bind(this); // Jeff would be proud
  }

  renderPlayerName(name) {
    const { playerName, data } = this.props;
    const link = <Link to={playerLink(data.shard, name)}>{name}</Link>;
    return (
      <li key={name}>
        {name === playerName ? <b>{link}</b> : link}
      </li>
    );
  }

  render() {
    const { consts, data, color } = this.props;
    const { game_modes: gameModes, perspectives, maps } = consts;
    const {
      match_id: matchId,
      match,
      roster,
      stats,
    } = data;
    const travelDistance = (stats.walk_distance + stats.ride_distance) / 1000; // Convert to km
    const rosterNames = roster.map(player => player.player_name);

    return (
      <Panel className="player-match-summary" style={{ backgroundColor: color }}>
        <Panel.Heading>
          <Panel.Title>
            {gameModes[match.mode]} {perspectives[match.perspective]}
          </Panel.Title>
          <Panel.Title style={{ textAlign: 'right' }}>
            {formatDate(match.date, 'MMMM D, HH:mm')}
          </Panel.Title>
          <Panel.Title>{maps[match.map_name]}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <h3 className="placement">
            <Link to={matchLink(matchId)}>#{stats.win_place}</Link>
          </h3>
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
            {rosterNames.map(this.renderPlayerName)}
          </ul>
        </Panel.Body>
      </Panel>
    );
  }
}

PlayerMatchSummary.propTypes = {
  consts: PropTypes.objectOf(PropTypes.object).isRequired,
  playerName: PropTypes.string.isRequired,
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  color: PropTypes.string,
};

PlayerMatchSummary.defaultProps = {
  color: 'white',
};

export default PlayerMatchSummary;
