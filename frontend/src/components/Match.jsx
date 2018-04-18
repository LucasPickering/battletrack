import React, { Component } from 'react';
import { ListGroup } from 'react-bootstrap';

import api from '../api';
import {
  formatDate,
  formatSeconds,
  makeTable,
  sortKeyFunc,
  translateGameMode,
  translateMap,
} from '../util';
import RosterMatchSummary from './RosterMatchSummary';

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
    api.get(`/api/matches/${this.matchId}`)
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
        <h2>{translateGameMode(matchData.mode)}</h2>
        <h3>{formatDate(matchData.date)}</h3>
        {makeTable([
          ['Map', translateMap(matchData.map_name)],
          ['Duration', formatSeconds(matchData.duration)],
        ])}
        <ListGroup>
          {rosters.map(r => <RosterMatchSummary key={r.id} data={r} />)}
        </ListGroup>
      </div>
    );
  }
};
export default Match;
