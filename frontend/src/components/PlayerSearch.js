import PropTypes from 'prop-types';
import React from 'react';
import { Button, FormControl } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

import { playerLink } from '../util/funcs';
import Icon from './Icon';
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
    const { searchName, shard } = this.state;

    return (
      <div className="player-search">
        <ShardSelect
          activeShard={shard}
          onSelect={newShard => this.setState({ shard: newShard })}
        />
        <div className="name-input-container">
          <FormControl
            className="name-input"
            type="text"
            placeholder="Player name..."
            onChange={e => this.setState({ searchName: e.target.value })}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                this.search();
              }
            }}
          />
          <Button
            className="search-button"
            disabled={!searchName}
            onClick={this.search}
          >
            <Icon name="search" />
          </Button>
        </div>
      </div>
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
