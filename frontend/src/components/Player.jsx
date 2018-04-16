import React, { Component } from 'react';
import {
  Table,
} from 'react-bootstrap';

import api from '../api';
import '../styles/Player.css'

class Player extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      playerData: null,
    };

    this.playerName = props.match.params.playerName;
  }

  componentDidMount() {
    // Load player's data from the API
    api.get(`/api/players/pc-na/${this.playerName}?populate`)
      .then(response => this.setState({ playerData: response.data }))
      .catch(console.error);
  }

  render() {
    const matchData  = this.state.playerData ? this.state.playerData.matches : [];
    const rows = matchData.map(d => {
      const stats = d.stats || {};
      return (
        <tr key={d.match_id}>
          <td>{d.match_id}</td>
          <td>{stats.kills}</td>
        </tr>
      );
    });

    return (
      <div>
        <h2>{this.playerName}</h2>
        <Table className="matchTable">
          <thead>
            <tr>
              <th>Match ID</th>
              <th>Kills</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </div>
    );
  }
};
export default Player;
