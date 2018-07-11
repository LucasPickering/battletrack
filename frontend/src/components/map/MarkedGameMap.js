import PropTypes from 'prop-types';
import React from 'react';

import { SpecialMarkTypes } from 'util/MarkMappers';
import RosterPalette from 'util/RosterPalette';
import GameMap from './GameMap';
import EventMarks from './EventMarks';

const MarkedGameMap = ({
  specialMarks,
  eventMarks,
  rosterPalette,
  ...rest
}) => (
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
);

MarkedGameMap.propTypes = {
  specialMarks: PropTypes.objectOf(PropTypes.any).isRequired,
  eventMarks: PropTypes.arrayOf(PropTypes.object).isRequired,
  rosterPalette: PropTypes.instanceOf(RosterPalette).isRequired,
};

export default MarkedGameMap;
