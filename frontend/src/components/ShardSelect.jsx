import PropTypes from 'prop-types';
import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

import { formatShard } from '../util/funcs';
import ApiComponent from './ApiComponent';

const ShardSelectHelper = ({ shards, activeShard, ...rest }) => (
  <DropdownButton
    className="shard-select"
    title={formatShard(activeShard)}
    id="shards-dropdown"
    {...rest}
  >
    {shards.map(shard => (
      <MenuItem key={shard} eventKey={shard}>{formatShard(shard)}</MenuItem>
    ))}
  </DropdownButton>
);

ShardSelectHelper.propTypes = {
  shards: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeShard: PropTypes.string.isRequired,
};

const ShardSelect = props => (
  <ApiComponent
    url="/api/core/shards"
    component={ShardSelectHelper}
    dataProp="shards"
    {...props}
  />
);

export default ShardSelect;
