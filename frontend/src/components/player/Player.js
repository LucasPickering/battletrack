import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Actions } from 'redux/actions';
import BtPropTypes from 'util/BtPropTypes';
import ErrorMessage from '../ErrorMessage';
import PlayerHeader from './PlayerHeader';
import PlayerMatches from './PlayerMatches';
import 'styles/player/Player.css';

class Player extends React.PureComponent {
  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate() {
    this.loadData();
  }

  loadData() {
    const {
      shard: newShard,
      name: newName,
      player: {
        shard: oldShard,
        name: oldName,
        loading,
        data,
        error,
      },
      fetchPlayer,
    } = this.props;

    // If there is no data and no error (load hasn't happened yet), OR shard OR name is outdated,
    // fetch data for the current shard/player
    if ((!data && !error && !loading) || oldShard !== newShard || oldName !== newName) {
      fetchPlayer(newShard, newName);
    }
  }

  render() {
    const {
      shard,
      name,
      player: {
        data,
        error,
      },
    } = this.props;
    return (
      <div className="player">
        <PlayerHeader shard={shard} name={name} />
        {data && <PlayerMatches data={data} />}
        {error && <ErrorMessage error={error} />}
      </div>
    );
  }
}

Player.propTypes = {
  shard: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  player: BtPropTypes.playerApiStatus.isRequired,
  fetchPlayer: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  player: state.player,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchPlayer: Actions.player.request,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Player);
