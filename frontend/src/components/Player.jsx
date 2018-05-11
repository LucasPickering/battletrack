import React from 'react';
import {
  ListGroup,
} from 'react-bootstrap';

import api from '../api';
import {
  playerLink,
  sortKeyFunc,
} from '../util';
import ApiComponent from './ApiComponent';
import PlayerMatchSummary from './PlayerMatchSummary';
import ShardSelect from './ShardSelect';
import '../styles/Player.css';

class Player extends ApiComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      playerData: null,
    };
  }

  refresh(params) {
    this.setState({ playerData: null }); // Wipe out old player data
    // Load new player data from the API
    const { shard, playerName } = params;
    api.get(`/api/core/players/${shard}/${playerName}?popMatches`)
      .then(response => this.setState({ playerData: response.data }))
      .catch(console.error);
  }

  renderMatches() {
    const { playerData } = this.state;
    return (
      <ListGroup>
        {playerData.matches
          .filter(m => m.match) // Filter out null matches
          .sort(sortKeyFunc(m => m.match.date, true)) // Sort by date
          .map(m => <PlayerMatchSummary key={m.match_id} data={m} />)}
      </ListGroup>
    );
  }

  render() {
    const { shard, playerName } = this.props.match.params;

    return (
      <div className="player">
        <h2>{playerName}</h2>
        <ShardSelect
          value={shard}
          onChange={e => this.props.history.push(playerLink(e.target.value, playerName))}
        />
        {this.state.playerData ? this.renderMatches() : 'No data'}
      </div>
    );
  }
};
export default Player;
