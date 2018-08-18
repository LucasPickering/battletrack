import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import BtPropTypes from 'util/BtPropTypes';
import { gameModes, perspectives } from 'util/formatters';
import { playerLink } from 'util/links';
import Localization from 'util/Localization';

import AllButtonGroup from 'components/AllButtonGroup';
import ShardSelect from 'components/ShardSelect';
import 'styles/player/PlayerHeader.css';

const MAPS = [
  'Erangel_Main',
  'Desert_Main',
  'Savage_Main',
].map(key => ({ key, label: Localization.maps[key] }));

const PlayerHeader = ({
  history,
  shard,
  name,
  filters: {
    mode: modeFilter,
    perspective: perspectiveFilter,
    map: mapFilter,
  },
  onChangeFilter,
}) => (
  <div className="player-header">
    <h2>{name}</h2>
    <ShardSelect
      activeShard={shard}
      onSelect={newShard => history.push(playerLink(newShard, name))}
    />
    <div className="player-filter-buttons">
      <AllButtonGroup
        className="game-mode-buttons"
        name="gameModes"
        values={gameModes}
        selected={modeFilter}
        onChange={selected => onChangeFilter({ mode: selected })}
      />
      <AllButtonGroup
        className="perspective-buttons"
        name="perspectives"
        values={perspectives}
        selected={perspectiveFilter}
        onChange={selected => onChangeFilter({ perspective: selected })}
      />
      <AllButtonGroup
        className="map-buttons"
        name="maps"
        values={MAPS}
        selected={mapFilter}
        onChange={selected => onChangeFilter({ map: selected })}
      />
    </div>
  </div>
);

PlayerHeader.propTypes = {
  history: BtPropTypes.history.isRequired,
  shard: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  filters: PropTypes.objectOf(PropTypes.string).isRequired,
  onChangeFilter: PropTypes.func.isRequired,
};

export default withRouter(PlayerHeader);
