import PropTypes from 'prop-types';
import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { connect } from 'react-redux';

import FilterContext from 'context/FilterContext';
import DataPropTypes from 'proptypes/DataPropTypes';
import 'styles/player/PlayerMatches.css';

import PlayerMatchSummary from './PlayerMatchSummary';

function makeFilterPredicate(filterCfgs, filterVals) {
  // Apply each filter, AND them together
  return m => filterCfgs.every(({ key, extractor }) => {
    const filterVal = filterVals[key];
    return !filterVal || filterVal === extractor(m); // If filterVal is null, let all through
  });
}

const PlayerMatches = ({ player: { name, matches }, filterCfgs }) => (
  <FilterContext.Consumer>
    {({ filterVals }) => {
      const filteredMatches = matches.filter(
        makeFilterPredicate(filterCfgs, filterVals),
      );
      return (
        <div className="player-matches-container">
          <p className="player-match-count">{filteredMatches.length} matches</p>
          <ListGroup className="player-matches">
            {filteredMatches.map(m => (
              <PlayerMatchSummary
                key={m.match_id}
                playerName={name}
                match={m}
              />
            ))}
          </ListGroup>
        </div>
      );
    }}
  </FilterContext.Consumer>
);

PlayerMatches.propTypes = {
  player: DataPropTypes.player.isRequired,
  filterCfgs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      extractor: PropTypes.func.isRequired,
    }),
  ).isRequired,
};

const mapStateToProps = state => ({
  player: state.api.player.data,
});

export default connect(mapStateToProps)(PlayerMatches);
