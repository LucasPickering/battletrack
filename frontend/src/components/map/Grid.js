import React from 'react';
import { range } from 'lodash';
import PropTypes from 'prop-types';
import { Polyline } from 'react-leaflet';


const GridLine = ({
  d,
  mapSize,
  major,
  vertical,
  ...rest
}) => (
  <Polyline
    positions={vertical ? [[d, 0], [d, mapSize]] : [[0, d], [mapSize, d]]}
    opacity={0.7}
    color={major ? '#999' : '#777'}
    weight={major ? 2 : 0.7}
    {...rest}
  />
);

GridLine.propTypes = {
  d: PropTypes.number.isRequired,
  mapSize: PropTypes.number.isRequired,
  major: PropTypes.bool.isRequired,
  vertical: PropTypes.bool,
};

GridLine.defaultProps = {
  vertical: false,
};

const Grid = ({ mapSize, minorStep, majorStep }) => range(minorStep, mapSize, minorStep).map(d => {
  const major = (d % majorStep === 0);
  return (
    <div key={d}>
      <GridLine d={d} mapSize={mapSize} major={major} />
      <GridLine d={d} mapSize={mapSize} major={major} vertical />
    </div>
  );
});

Grid.propTypes = {
  mapSize: PropTypes.number.isRequired,
  minorStep: PropTypes.number,
  majorStep: PropTypes.number,
};

Grid.defaultProps = {
  minorStep: 100,
  majorStep: 1000,
};

export default Grid;
