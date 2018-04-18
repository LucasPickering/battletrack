import React, { Component } from 'react';
import { ListGroup } from 'react-bootstrap';

import api from '../api';
import PlayerMatchSummary from './PlayerMatchSummary';
import '../styles/Player.css';

class Player extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      playerData: null,
    };
  }

  componentDidMount() {
    this.updatePlayerData();
  }

  componentWillReceiveProps(nextProps) {
    const { playerName: oldName } = this.props.match.params;
    const { playerName: newName } = nextProps.match.params;

    // If the player name changed, fetch the new player's data
    if (oldName !== newName) {
      this.updatePlayerData();
    }
  }

  updatePlayerData() {
    this.setState({ playerData: null }); // Wipe any old data
    // Load player's data from the API
    api.get(`/api/players/pc-na/${this.props.match.params.playerName}?populate`)
      .then(response => this.setState({ playerData: response.data }))
      .catch(console.error);
  }

  render() {
    const { playerData } = this.state;

    return playerData && (
      <div className="player">
        <h2>{playerData.name}</h2>
        <ListGroup>
          {playerData.matches
            .filter(m => m.match) // Filter out null matches
            .map(m => <PlayerMatchSummary key={m.match_id} data={m} />)}
        </ListGroup>
      </div>
    );
  }
};
export default Player;
