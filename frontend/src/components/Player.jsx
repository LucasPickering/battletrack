import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

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
    // Get match data from the player. Filter out null matches.
    const { playerData } = this.state;
    const matchData  = playerData ? playerData.matches.filter(d => d.match) : [];
    const columns = [
      {dataField: 'match.mode', text: 'Game Mode'},
      {dataField: 'match.map_name', text: 'Map'},
      {dataField: 'stats.win_place', text: 'Placement'},
      {dataField: 'stats.time_survived', text: 'Time Alive'},
      {dataField: 'stats.kills', text: 'Kills'},
      {dataField: 'stats.assists', text: 'Assists'},
    ];
    return (
      <BootstrapTable keyField="match_id" data={matchData} columns={columns} />
    );
  }
};
export default Player;
