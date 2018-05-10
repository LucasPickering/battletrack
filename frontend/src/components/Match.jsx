import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';

import api from '../api';
import {
  formatDate,
  formatSeconds,
  formatGameMode,
  formatPerspective,
  formatMap,
  sortKeyFunc,
} from '../util';
import RosterMatchSummary from './RosterMatchSummary';
import '../styles/Match.css';

class Match extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      matchData: null,
    };

    this.matchId = props.match.params.matchId;
  }

  componentDidMount() {
    // Load player's data from the API
    api.get(`/api/core/matches/${this.matchId}`)
      .then(response => this.setState({ matchData: response.data }))
      .catch(console.error);
  }

  render() {
    const { matchData } = this.state;
    if (!matchData) {
      return null;
    }

    const rosters = matchData.rosters.sort(sortKeyFunc(r => r.win_place));

    return (
      <div className="match">
        <h2>{formatGameMode(matchData.mode)} {formatPerspective(matchData.perspective)}</h2>
        <h2>{formatMap(matchData.map_name)}</h2>
        <h3>{formatDate(matchData.date, 'MMMM D, YYYY HH:mm:ss')}</h3>
        <h3>{formatSeconds(matchData.duration)}</h3>
        <Panel className="rosters">
          {rosters.map(r => <RosterMatchSummary key={r.id} data={r} />)}
        </Panel>
      </div>
    );
  }
};
export default Match;
