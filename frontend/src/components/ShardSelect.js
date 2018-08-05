import React from 'react';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import actions from 'redux/actions';
import BtPropTypes from 'util/BtPropTypes';
import { formatShard } from 'util/funcs';
import ApiView from 'views/ApiView';

import 'styles/ShardSelect.css';

const ShardList = ({ shards }) => shards.map(shard => (
  <MenuItem key={shard} eventKey={shard}>{formatShard(shard)}</MenuItem>
));

ShardList.propTypes = {
  shards: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

class ShardSelect extends ApiView {
  updateData() {
    const { fetchShardsIfNeeded } = this.props;
    fetchShardsIfNeeded();
  }

  render() {
    const { activeShard, shardsState, onSelect } = this.props;
    return (
      <div className="shard-select">
        <DropdownButton
          title={formatShard(activeShard)}
          id="shards-dropdown"
          onSelect={onSelect}
        >
          {!shardsState.loading && shardsState.data && <ShardList shards={shardsState.data} />}
        </DropdownButton>
      </div>
    );
  }
}

ShardSelect.propTypes = {
  activeShard: PropTypes.string.isRequired,
  shardsState: BtPropTypes.apiState.isRequired,
  onSelect: PropTypes.func,
  fetchShardsIfNeeded: PropTypes.func.isRequired,
};

ShardSelect.defaultProps = {
  onSelect: noop,
};

const mapStateToProps = state => ({
  shardsState: state.api.shards,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchShardsIfNeeded: actions.api.shards.requestIfNeeded,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ShardSelect);
