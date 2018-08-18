import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import FilterContext from 'context/FilterContext';
import ApiPropTypes from 'proptypes/ApiPropTypes';
import actions from 'redux/actions';
import { gameModes, perspectives } from 'util/formatters';
import Localization from 'util/Localization';

import ApiDataComponent from 'components/ApiDataComponent';
import PlayerHeader from 'components/player/PlayerHeader';
import PlayerMatches from 'components/player/PlayerMatches';

import 'styles/player/PlayerView.css';

import ApiView from './ApiView';

const MAPS = [
  'Erangel_Main',
  'Desert_Main',
  'Savage_Main',
].map(key => ({ key, label: Localization.maps[key] }));

const FILTER_CFGS = Object.freeze([
  {
    key: 'mode',
    values: gameModes,
    extractor: m => m.summary.mode,
  },
  {
    key: 'perspective',
    values: perspectives,
    extractor: m => m.summary.perspective,
  },
  {
    key: 'map',
    values: MAPS,
    extractor: m => m.summary.map_name,
  },
]);


class PlayerView extends ApiView {
  constructor(...args) {
    super(...args);
    this.state = {
      filterVals: {},
    };
    this.setFilterVal = this.setFilterVal.bind(this);
  }

  updateData() {
    const {
      shard,
      name,
      fetchPlayerIfNeeded,
    } = this.props;
    fetchPlayerIfNeeded({ shard, name });
  }

  setFilterVal(filterKey, filterVal) {
    const { filterVals } = this.state;
    this.setState({
      filterVals: {
        ...filterVals, // Old filter values, don't forget these!
        [filterKey]: filterVal,
      },
    });
  }

  render() {
    const {
      shard,
      name,
      playerState,
    } = this.props;
    const { filterVals } = this.state;

    return (
      <div className="player">
        <FilterContext.Provider value={{ filterVals, setFilterVal: this.setFilterVal }}>
          <PlayerHeader
            shard={shard}
            name={name}
            filterCfgs={FILTER_CFGS}
          />
          <ApiDataComponent
            component={PlayerMatches}
            state={playerState}
            loadingText="Loading matches..."
            filterCfgs={FILTER_CFGS}
          />
        </FilterContext.Provider>
      </div>
    );
  }
}

PlayerView.propTypes = {
  shard: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  playerState: ApiPropTypes.apiState.isRequired,
  fetchPlayerIfNeeded: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  playerState: state.api.player,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchPlayerIfNeeded: actions.api.player.requestIfNeeded,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PlayerView);
