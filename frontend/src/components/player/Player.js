import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Actions } from 'redux/actions';
import BtPropTypes from 'util/BtPropTypes';

import ApiComponent from '../ApiComponent2';
import ApiStatusComponent from '../ApiStatusComponent';
import PlayerHeader from './PlayerHeader';
import PlayerMatches from './PlayerMatches';
import 'styles/player/Player.css';

class Player extends ApiComponent {
  constructor(props, context) {
    super(props, context, props.fetchPlayer, 'player', ['shard', 'name']);
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
        <ApiStatusComponent
          component={PlayerMatches}
          status={player}
          loadingText="Loading player..."
        />
      </div>
    );
  }
}

Player.propTypes = {
  shard: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  player: BtPropTypes.apiStatus.isRequired,
  fetchPlayer: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  player: state.player,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchPlayer: Actions.player.request,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Player);
