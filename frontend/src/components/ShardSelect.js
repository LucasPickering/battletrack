import PropTypes from 'prop-types';
import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

import { SHARDS, formatShard } from 'util/funcs';
import 'styles/ShardSelect.css';

const ShardSelect = ({ activeShard, ...rest }) => (
  <div className="shard-select">
    <DropdownButton
      title={formatShard(activeShard)}
      id="shards-dropdown"
      {...rest}
    >
      {SHARDS.map(shard => (
        <MenuItem key={shard} eventKey={shard}>{formatShard(shard)}</MenuItem>
      ))}
    </DropdownButton>
  </div>
);

ShardSelect.propTypes = {
  activeShard: PropTypes.string.isRequired,
};

export default ShardSelect;
