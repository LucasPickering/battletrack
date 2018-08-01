import PropTypes from 'prop-types';
import React from 'react';
import { LayerGroup } from 'react-leaflet';

import { SpecialMarkTypes } from 'util/MarkMappers';
import RosterPalette from 'util/RosterPalette';
import GameMap from './GameMap';
import EventMark from './EventMark';

function renderSpecialMarks(marks) {
  return Object.entries(marks)
    .map(([markType, markData]) => (
      <LayerGroup key={markType}>
        {React.createElement(SpecialMarkTypes[markType].component, {
          data: markData,
          key: markType,
        })}
      </LayerGroup>
    ));
}

const MarkedGameMap = ({
  specialMarks,
  eventMarks,
  rosterPalette,
  ...rest
}) => (
  <GameMap {...rest}>
    {renderSpecialMarks(specialMarks)}
    {eventMarks.map(mark => (
      <EventMark
        {...mark}
        rosterPalette={rosterPalette}
      />
    ))}
  </GameMap>
);

MarkedGameMap.propTypes = {
  specialMarks: PropTypes.objectOf(PropTypes.any).isRequired,
  eventMarks: PropTypes.arrayOf(PropTypes.object).isRequired,
  rosterPalette: PropTypes.instanceOf(RosterPalette).isRequired,
};

export default MarkedGameMap;
