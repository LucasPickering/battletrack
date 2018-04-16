import React, { Component } from 'react';
import {
  Button,
  FormControl,
  FormGroup,
  InputGroup,
  Table,
} from 'react-bootstrap';

import api from '../api';
import '../styles/MatchSearch.css'

function formatStats(field, cell) {
  return cell && cell[field];
}

class MatchSearch extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      searchName: '',
      playerData: null,
    };

    this.search = this.search.bind(this);
  }

  search() {
    api.get(`/api/players/pc-na/${this.state.searchName}`)
      .then(response => this.setState({ playerData: response.data }))
      .catch(console.error);
  }

  render() {
    console.log(this.state.playerData);
    const matchData  = this.state.playerData ? this.state.playerData.matches : [];
    const rows = matchData.map(d => {
      const stats = d.stats || {};
      return (
        <tr>
          <td>{d.match_id}</td>
          <td>{stats.kills}</td>
        </tr>
      );
    });

    return (
      <FormGroup className="matchSearch">
        <InputGroup>
          <FormControl
            type="text"
            // value={this.state.value}
            placeholder="Name"
            onChange={e => this.setState({ searchName: e.target.value })}
          />
          <InputGroup.Button>
            <Button onClick={this.search}>Search</Button>
          </InputGroup.Button>
        </InputGroup>

        <Table>
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
      </FormGroup>
    );
  }
};
export default MatchSearch;
