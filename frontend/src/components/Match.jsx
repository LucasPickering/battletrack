import PropTypes from 'prop-types';
import React from 'react';
import { Panel } from 'react-bootstrap';

import api from '../api';
import {
  formatDate,
  formatSeconds,
  sortKeyFunc,
} from '../util';
import ApiComponent from './ApiComponent';
import RosterMatchSummary from './RosterMatchSummary';
import Replay from './Replay';
import '../styles/Match.css';

class Match extends ApiComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      matchData: null,
    };
  }

  refresh() {
    this.setState({ matchData: null }); // Wipe out old match data
    // Load match data from the API
    api.get(`/api/core/matches/${this.props.match.params.matchId}`)
      .then(response => this.setState({ matchData: response.data }))
      .catch(console.error);
  }

  renderMatch() {
    // Unpack props
    const { consts } = this.props;
    const { game_modes: gameModes, perspectives, maps } = consts;

    // Unpack state
    const { matchData } = this.state;
    const {
      shard,
      mode,
      perspective,
      map_name: mapName,
      date,
      duration,
      rosters,
    } = matchData;
    const sortedRosters = rosters.sort(sortKeyFunc(r => r.win_place)); // Winners first

    return (
      <div className="match">
        <h2>{gameModes[mode]} {perspectives[perspective]}</h2>
        <h2>{maps[mapName]}</h2>
        <h3>{formatDate(date, 'MMMM D, YYYY HH:mm:ss')}</h3>
        <h3>{formatSeconds(duration)}</h3>
        <Panel className="rosters">
          {sortedRosters.map((r, index) => (
            <RosterMatchSummary key={index} shard={shard} data={r} />
          ))}
        </Panel>
        <Replay consts={consts} match={matchData} />
      </div>
    );
  }

  render() {
    return this.state.matchData && this.renderMatch();
  }
}

Match.propTypes = {
  consts: PropTypes.objectOf(PropTypes.object).isRequired,
};

export default Match;
