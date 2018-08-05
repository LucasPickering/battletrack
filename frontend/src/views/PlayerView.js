import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import actions from 'redux/actions';
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
      fetchPlayerIfNeeded,
    } = this.props;
    fetchPlayerIfNeeded({ shard, name });
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
          loadingText="Loading matches..."
        />
      </div>
    );
  }
}

PlayerView.propTypes = {
  shard: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  playerState: BtPropTypes.apiState.isRequired,
  fetchPlayerIfNeeded: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  playerState: state.api.player,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchPlayerIfNeeded: actions.api.player.requestIfNeeded,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PlayerView);
