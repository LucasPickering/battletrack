import PropTypes from 'prop-types';
import React from 'react';
import {
  Button,
  FormControl,
  FormGroup,
  InputGroup,
} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

import { playerLink } from '../util/funcs';
import ShardSelect from './ShardSelect';
import '../styles/PlayerSearch.css';

class PlayerSearch extends React.PureComponent {
  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      searchName: '',
      shard: props.defaultShard,
    };

    this.search = this.search.bind(this);
  }

  search() {
    const { searchName, shard } = this.state;
    this.props.history.push(playerLink(shard, searchName));
  }

  render() {
    const { shard } = this.state;

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
          <InputGroup.Addon className="shard-select-addon">
            <ShardSelect
              activeShard={shard}
              onSelect={newShard => this.setState({ shard: newShard })}
            />
          </InputGroup.Addon>
          <InputGroup.Button>
            <Button onClick={this.search}>Search</Button>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }
}

PlayerSearch.propTypes = {
  defaultShard: PropTypes.string,
  history: PropTypes.objectOf(PropTypes.any).isRequired,
};

PlayerSearch.defaultProps = {
  defaultShard: 'pc-na', // Obviously the best
};

export default withRouter(PlayerSearch);
