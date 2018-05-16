import React from 'react';
import { Button, Modal, Panel } from 'react-bootstrap';
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
      match: null,
      showReplay: false,
    };
  }

  refresh() {
    this.setState({ match: null }); // Wipe out old match data
    // Load match data from the API
    api.get(`/api/core/matches/${this.props.match.params.matchId}`)
      .then(response => this.setState({ match: response.data }))
      .catch(console.error);
  }

  renderMatch() {
    // Unpack state
    const { match, showReplay } = this.state;
    const {
      shard,
      mode,
      perspective,
      map_name: mapName,
      date,
      duration,
      rosters,
    } = match;
    const sortedRosters = rosters.sort(sortKeyFunc(r => r.win_place)); // Winners first

    return (
      <div className="match">
        <Modal
          show={showReplay}
          onHide={() => this.setState({ showReplay: false })}
        >
          <Modal.Header closeButton />
          <Modal.Body>
            <Replay match={match} />
          </Modal.Body>
        </Modal>

        <h2>{formatGameMode(mode)} {formatPerspective(perspective)}</h2>
        <h2>{mapName}</h2>
        <h3>{formatDate(date, 'MMMM D, YYYY HH:mm:ss')}</h3>
        <h3>{formatSeconds(duration)}</h3>

        <Button onClick={() => this.setState({ showReplay: true })}>Match Replay</Button>

        <Panel className="rosters">
          {sortedRosters.map(r => <RosterMatchSummary key={uniqid()} shard={shard} data={r} />)}
        </Panel>
      </div>
    );
  }

  render() {
    return this.state.match && this.renderMatch();
  }
}

export default Match;
