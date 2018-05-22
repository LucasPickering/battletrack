import React, { Component } from 'react';
import { FormControl } from 'react-bootstrap';

import api from '../api';
import { formatShard } from '../util';

class ShardSelect extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      shards: [],
    };
  }

  componentDidMount() {
    api.get('/api/core/shards')
      .then(response => this.setState({ shards: response.data }))
      .catch(console.error);
  }

  render() {
    const { shards } = this.state;
    return (
      <FormControl
        className="shardSelect"
        componentClass="select"
        {...this.props}
      >
        {shards.map(shard => (
          <option key={shard} value={shard}>{formatShard(shard)}</option>
        ))}
      </FormControl>
    );
  }
}

export default ShardSelect;
