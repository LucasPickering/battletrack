import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Button, Panel } from 'react-bootstrap';
import uniqid from 'uniqid';

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

class Match extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showReplay: true, // TODO: change this to false when done developing
    };
    this.renderMatch = this.renderMatch.bind(this);
  }

  renderMatch(matchData) {
    // Unpack state
    const { showReplay } = this.state;
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

        <div className="replay-container">
          <Button onClick={() => this.setState({ showReplay: !showReplay })}>Match Replay</Button>
          {showReplay && <Replay matchData={matchData} />}
        </div>

        <Panel className="rosters">
          {sortedRosters.map(r => <RosterMatchSummary key={uniqid()} shard={shard} data={r} />)}
        </Panel>
      </div>
    );
  }

  render() {
    return (
      <ApiComponent
        url={`/api/core/matches/${this.props.match.params.matchId}`}
        render={this.renderMatch}
      />
    );
  }
}

Match.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Match;
