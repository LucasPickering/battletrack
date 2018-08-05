import React from 'react';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import actions from 'redux/actions';
import { formatShard } from 'util/formatters';
import ApiView from 'views/ApiView';

import 'styles/ShardSelect.css';

class ShardSelect extends ApiView {
  updateData() {
    const { fetchShardsIfNeeded } = this.props;
    fetchShardsIfNeeded();
  }

  render() {
    const { activeShard, shards, onSelect } = this.props;
    return (
      <div className="shard-select">
        <DropdownButton
          title={formatShard(activeShard)}
          id="shards-dropdown"
          onSelect={onSelect}
        >
          {shards && shards.map(shard => (
            <MenuItem key={shard} eventKey={shard}>{formatShard(shard)}</MenuItem>
          ))}
        </DropdownButton>
      </div>
    );
  }
}

ShardSelect.propTypes = {
  activeShard: PropTypes.string.isRequired,
  shards: PropTypes.arrayOf(PropTypes.string.isRequired),
  onSelect: PropTypes.func,
  fetchShardsIfNeeded: PropTypes.func.isRequired,
};

ShardSelect.defaultProps = {
  shards: [],
  onSelect: noop,
};

const mapStateToProps = state => ({
  shards: state.api.shards.data,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchShardsIfNeeded: actions.api.shards.requestIfNeeded,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ShardSelect);
