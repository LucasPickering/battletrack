import React, { Component } from 'react';
import { FormControl } from 'react-bootstrap';

import api from '../api';

class ShardSelect extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      shards: [],
    };
  }

  componentDidMount() {
    api.get('/api/core/consts')
      .then(response => this.setState({ shards: response.data.shards }))
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
        {shards.map(([dbName, humanName]) => (
          <option key={dbName} value={dbName}>{humanName}</option>
        ))}
      </FormControl>
    );
  }
};

export default ShardSelect;
