import PropTypes from 'prop-types';
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
    this.props.history.push(`/players/${this.state.searchName}`);
  }

  render() {
    return (
      <FormGroup className="player-search">
        <InputGroup>
          <FormControl
            type="text"
            // value={this.state.value}
            placeholder="Player name..."
            onChange={e => this.setState({ searchName: e.target.value })}
            onKeyPress={e =>{
              if (e.key === 'Enter') {
                this.search();
              }
            }}
          />
          <InputGroup.Button>
            <Button onClick={this.search}>Search</Button>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }
};

PlayerSearch.contextTypes = {
  router: PropTypes.object,
}

export default withRouter(PlayerSearch);
