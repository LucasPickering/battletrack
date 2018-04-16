import React, { Component } from 'react';
import {
  Button,
  FormControl,
  FormGroup,
  InputGroup,
} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

import '../styles/PlayerSearch.css'

class PlayerSearch extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      searchName: '',
    };

    this.search = this.search.bind(this);
  }

  search() {
    this.props.history.push(`/players/${this.state.searchName}`)
  }

  render() {
    return (
      <FormGroup className="playerSearch">
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
      </FormGroup>
    );
  }
};
export default withRouter(PlayerSearch);
