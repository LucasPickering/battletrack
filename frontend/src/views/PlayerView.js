import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { apiActions } from 'redux/api/apiActions';
import BtPropTypes from 'util/BtPropTypes';
import { isApiStateStale } from 'util/funcs';
import ApiDataComponent from 'components/ApiDataComponent';
import PlayerHeader from 'components/player/PlayerHeader';
import PlayerMatches from 'components/player/PlayerMatches';

import ApiView from './ApiView';

import 'styles/player/PlayerView.css';


class PlayerView extends ApiView {
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

PlayerView.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(PlayerView);
