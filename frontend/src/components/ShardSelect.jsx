import PropTypes from 'prop-types';
import React from 'react';
import { FormControl } from 'react-bootstrap';

const ShardSelect = props => {
  const { shards, ...rest } = props;

  return (
    <FormControl
      className="shardSelect"
      componentClass="select"
      {...rest}
    >
      {Object.entries(shards).map(([dbName, humanName]) => (
        <option key={dbName} value={dbName}>{humanName}</option>
      ))}
    </FormControl>
  );
};

ShardSelect.propTypes = {
  shards: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default ShardSelect;
