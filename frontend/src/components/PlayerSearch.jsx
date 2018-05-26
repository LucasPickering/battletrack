import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  Button,
  FormControl,
  FormGroup,
  InputGroup,
} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

import { playerLink } from '../util/funcs';
import '../styles/PlayerSearch.css';

class PlayerSearch extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      searchName: '',
    };

    this.search = this.search.bind(this);
  }

  search() {
    this.props.history.push(playerLink('pc-na', this.state.searchName));
  }

  render() {
    return (
      <FormGroup className="player-search">
        <InputGroup>
          <FormControl
            type="text"
            placeholder="Player name..."
            onChange={e => this.setState({ searchName: e.target.value })}
            onKeyPress={e => {
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
}

PlayerSearch.propTypes = {
  history: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default withRouter(PlayerSearch);
