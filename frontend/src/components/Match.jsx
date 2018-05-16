import React from 'react';
import { Panel } from 'react-bootstrap';
import uniqid from 'uniqid';

import api from '../api';
import {
  formatDate,
  formatSeconds,
  formatGameMode,
  formatPerspective,
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
        <h2>{formatGameMode(mode)} {formatPerspective(perspective)}</h2>
        <h2>{mapName}</h2>
        <h3>{formatDate(date, 'MMMM D, YYYY HH:mm:ss')}</h3>
        <h3>{formatSeconds(duration)}</h3>
        <Replay match={matchData} />
        <Panel className="rosters">
          {sortedRosters.map(r => <RosterMatchSummary key={uniqid()} shard={shard} data={r} />)}
        </Panel>
      </div>
    );
  }

  render() {
    return this.state.matchData && this.renderMatch();
  }
}

export default Match;
