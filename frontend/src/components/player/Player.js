import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { apiActions } from 'redux/api/apiActions';
import BtPropTypes from 'util/BtPropTypes';
import { isApiStateStale } from 'util/funcs';

import ApiComponent from '../ApiComponent2';
import ApiDataComponent from '../ApiDataComponent';
import PlayerHeader from './PlayerHeader';
import PlayerMatches from './PlayerMatches';
import 'styles/player/Player.css';

class Player extends ApiComponent {
  loadData() {
    const {
      shard,
      name,
      player,
      fetchPlayer,
    } = this.props;
    const newParams = { shard, name };

    if (isApiStateStale(newParams, player)) {
      fetchPlayer(newParams);
    }
  }

  render() {
    const {
      shard,
      name,
      player,
    } = this.props;
    return (
      <div className="player">
        <PlayerHeader shard={shard} name={name} />
        <ApiDataComponent
          component={PlayerMatches}
          states={{ player }}
          loadingText="Loading player..."
        />
      </div>
    );
  }
}

Player.propTypes = {
  shard: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  player: BtPropTypes.apiState.isRequired,
  fetchPlayer: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  player: state.api.player,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchPlayer: apiActions.player.request,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Player);
