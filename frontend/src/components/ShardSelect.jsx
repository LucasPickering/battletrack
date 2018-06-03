import PropTypes from 'prop-types';
import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

import { SHARDS, formatShard } from '../util/funcs';

const ShardSelect = ({ activeShard, ...rest }) => (
  <DropdownButton
    className="shard-select"
    title={formatShard(activeShard)}
    id="shards-dropdown"
    {...rest}
  >
    {SHARDS.map(shard => (
      <MenuItem key={shard} eventKey={shard}>{formatShard(shard)}</MenuItem>
    ))}
  </DropdownButton>
);

ShardSelect.propTypes = {
  activeShard: PropTypes.string.isRequired,
};

export default ShardSelect;
