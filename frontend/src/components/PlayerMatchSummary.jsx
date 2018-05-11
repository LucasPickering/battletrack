import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import {
  formatDate,
  formatSeconds,
  formatGameMode,
  formatPerspective,
  formatMap,
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
    const { data } = this.props;
    const { match_id, match, roster, stats } = data;
    const travelDistance = (stats.walk_distance + stats.ride_distance) / 1000; // Convert to km
    const rosterNames = roster.map(player => player.player_name);

    return (
      <Panel className="player-match-summary">
        <Panel.Heading>
          <Panel.Title>
            {formatGameMode(match.mode)} {formatPerspective(match.perspective)}
          </Panel.Title>
          <Panel.Title style={{ textAlign: 'right'}}>
            {formatDate(match.date, 'MMMM D, HH:mm')}
          </Panel.Title>
          <Panel.Title>{formatMap(match.map_name)}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <h3 className="placement">
            <Link to={matchLink(match_id)}>#{stats.win_place}</Link>
          </h3>
          <ul className="stats1">
            <Stat title="Kills" stats={[stats.kills]} />
          </ul>
          <ul className="stats2">
            <Stat title="Survived" stats={[stats.time_survived]} formatter={formatSeconds}/>
            <Stat
              title="Traveled"
              stats={[travelDistance]}
              formatter={dist => `${dist.toFixed(2)} km`}
            />
          </ul>
          <ul className="roster">
            {rosterNames.map(this.renderPlayerName)}
          </ul>
        </Panel.Body>
      </Panel>
    );
  }
}

PlayerMatchSummary.propTypes = {
  playerName: PropTypes.string.isRequired,
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default PlayerMatchSummary;
