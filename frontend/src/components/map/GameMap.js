import {
  CRS,
  Point,
  LatLng,
  transformation,
} from 'leaflet';
import PropTypes from 'prop-types';
import React from 'react';
import { Map, ImageOverlay } from 'react-leaflet';

import { mapImage } from 'util/funcs';
import BtPropTypes from 'util/BtPropTypes';

import LeafletComponent from 'components/map/LeafletComponent';
import 'styles/map/GameMap.css';

import Grid from './Grid';

// Custom coordinate system - simple Cartesian coordiates with top-left as origin
const CoordSystem = {
  ...CRS.Simple,
  projection: {
    project: latlng => new Point(latlng.lat, latlng.lng),
    unproject: point => new LatLng(point.x, point.y),
  },
  transformation: transformation(1, 0, 1, 0),
};

class GameMap extends LeafletComponent {
  render() {
    const {
      map: { name, size },
      showGrid,
      children,
      ...rest
    } = this.props;

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
  }
}

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
