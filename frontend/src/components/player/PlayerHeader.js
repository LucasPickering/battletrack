import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import FilterContext from 'context/FilterContext';
import CommonPropTypes from 'proptypes/CommonPropTypes';
import { playerLink } from 'util/links';

import AllButtonGroup from 'components/AllButtonGroup';
import ShardSelect from 'components/ShardSelect';
import 'styles/player/PlayerHeader.css';

const PlayerHeader = ({
  history,
  shard,
  name,
  filterCfgs,
}) => (
  <div className="player-header">
    <h2>{name}</h2>
    <ShardSelect
      activeShard={shard}
      onSelect={newShard => history.push(playerLink(newShard, name))}
    />
    <div className="player-filter-buttons">
      <FilterContext.Consumer>
        {({ filterVals, setFilterVal }) => filterCfgs.map(({ key, values }) => (
          <AllButtonGroup
            key={key}
            name={key}
            values={values}
            selected={filterVals[key]}
            onChange={selected => setFilterVal(key, selected)}
          />
        ))}
      </FilterContext.Consumer>
    </div>
  </div>
);

PlayerHeader.propTypes = {
  history: CommonPropTypes.history.isRequired,
  shard: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  filterCfgs: CommonPropTypes.filterCfgs.isRequired,
};

export default withRouter(PlayerHeader);
