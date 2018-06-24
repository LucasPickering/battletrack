import PropTypes from 'prop-types';
import React from 'react';

import BtPropTypes from '../util/BtPropTypes';
import { SpecialMarkTypes } from '../util/MarkMappers';
import RosterPalette from '../util/RosterPalette';
import GameMap from './GameMap';
import EventMarks from './EventMarks';

const MarkedGameMap = ({
  specialMarks,
  eventMarks,
  rosterPalette,
  children,
  ...rest
}) => (
  <div className="marked-game-map">
    <GameMap {...rest}>
      {Object.entries(specialMarks)
        .map(([markType, markData]) => SpecialMarkTypes[markType].render(markData, {
          key: markType,
        }))}
      <EventMarks
        marks={eventMarks}
        rosterPalette={rosterPalette}
      />
    </GameMap>
    {children}
  </div>
);

MarkedGameMap.propTypes = {
  specialMarks: PropTypes.objectOf(PropTypes.any).isRequired,
  eventMarks: PropTypes.arrayOf(PropTypes.object).isRequired,
  rosterPalette: PropTypes.instanceOf(RosterPalette).isRequired,
  children: BtPropTypes.children,
};

MarkedGameMap.defaultProps = {
  children: null,
};

export default MarkedGameMap;
