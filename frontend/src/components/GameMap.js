import { CRS, Point, LatLng, transformation } from 'leaflet';
import PropTypes from 'prop-types';
import React from 'react';
import { Map, ImageOverlay, Polyline } from 'react-leaflet';

import { mapImage, range } from '../util/funcs';
import BtPropTypes from '../util/BtPropTypes';

// Custom coordinate system - simple Cartesian coordiates with top-left as origin
const CoordSystem = {
  ...CRS.Simple,
  projection: {
    project: latlng => new Point(latlng.lat, latlng.lng),
    unproject: point => new LatLng(point.x, point.y),
  },
  transformation: transformation(1, 0, 1, 0),
};

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

const GameMap = ({
  map: { name, size },
  showGrid,
  children,
  ...rest
}) => {
  const bounds = [[0, 0], [size, size]];
  return (
    <Map
      className="game-map full-size"
      crs={CoordSystem}
      bounds={bounds}
      center={[size / 2, size / 2]}
      minZoom={-4}
      maxZoom={3}
      zoomSnap={0.25}
      {...rest}
    >
      <ImageOverlay url={mapImage(name)} bounds={bounds} />
      {showGrid && <Grid mapSize={size} />}
      {children}
    </Map>
  );
};

GameMap.propTypes = {
  map: BtPropTypes.map.isRequired,
  showGrid: PropTypes.bool,
  children: BtPropTypes.children,
};

GameMap.defaultProps = {
  showGrid: false,
  children: [],
};

export default GameMap;
