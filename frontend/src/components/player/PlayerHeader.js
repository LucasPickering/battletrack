import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import BtPropTypes from 'util/BtPropTypes';
import { playerLink } from 'util/funcs';
import ShardSelect from '../ShardSelect';
import 'styles/player/PlayerHeader.css';

const PlayerHeader = ({ history, shard, name }) => (
  <div className="player-header">
    <h2>{name}</h2>
    <ShardSelect
      activeShard={shard}
      onSelect={newShard => history.push(playerLink(newShard, name))}
    />
  </div>
);

PlayerHeader.propTypes = {
  history: BtPropTypes.history.isRequired,
  shard: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default withRouter(PlayerHeader);
