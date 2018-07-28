import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import actions from 'redux/actions';
import { isStateStale } from 'redux/api/apiSelectors';
import BtPropTypes from 'util/BtPropTypes';

import ApiDataComponent from 'components/ApiDataComponent';
import PlayerHeader from 'components/player/PlayerHeader';
import PlayerMatches from 'components/player/PlayerMatches';

import 'styles/player/PlayerView.css';

import ApiView from './ApiView';

class PlayerView extends ApiView {
  updateData() {
    const {
      shard,
      name,
      playerState,
      fetchPlayer,
    } = this.props;
    const newParams = { shard, name };

    if (isStateStale(playerState, newParams)) {
      fetchPlayer(newParams);
    }
  }

  render() {
    const {
      shard,
      name,
      playerState,
    } = this.props;
    return (
      <div className="player">
        <PlayerHeader shard={shard} name={name} />
        <ApiDataComponent
          component={PlayerMatches}
          state={playerState}
          loadingText="Loading player..."
        />
      </div>
    );
  }
}

PlayerView.propTypes = {
  shard: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  playerState: BtPropTypes.apiState.isRequired,
  fetchPlayer: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  playerState: state.api.player,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchPlayer: actions.api.player.request,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PlayerView);
