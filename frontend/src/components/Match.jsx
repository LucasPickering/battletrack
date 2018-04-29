import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';

import api from '../api';
import {
  formatDate,
  formatSeconds,
  formatGameMode,
  formatPerspective,
  formatMap,
  makeTable,
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
    api.get(`/api/matches/${this.matchId}?popTelemetry`)
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
        <h3>{formatDate(matchData.date)}</h3>
        {makeTable([
          ['Map', formatMap(matchData.map_name)],
          ['Duration', formatSeconds(matchData.duration)],
        ])}
        <Panel className="rosters">
          {rosters.map(r => <RosterMatchSummary key={r.id} data={r} />)}
        </Panel>
      </div>
    );
  }
};
export default Match;
