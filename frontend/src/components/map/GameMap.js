import {
  CRS,
  Point,
  LatLng,
  transformation,
} from 'leaflet';
import PropTypes from 'prop-types';
import React from 'react';
import { Map, TileLayer } from 'react-leaflet';

import CommonPropTypes from 'proptypes/CommonPropTypes';
import DataPropTypes from 'proptypes/DataPropTypes';
import { mapTilesUrl } from 'util/links';

import LeafletComponent from 'components/map/LeafletComponent';
import 'styles/map/GameMap.css';

import Grid from './Grid';

const MIN_ZOOM = -6;
const MAX_ZOOM = 2;

const TILE_ZOOM_LEVELS = 5;
const MIN_TILE_ZOOM = -4;
const MAX_TILE_ZOOM = MIN_TILE_ZOOM + TILE_ZOOM_LEVELS - 1; // Fencepost!

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
        // Unfortunately we have to specify zoom for the map AND the tile layer.
        // Shit gets funky otherwise.
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        zoomSnap={0.5}
        {...rest}
      >
        <TileLayer
          url={mapTilesUrl(name)}
          tileSize={(2 ** MIN_TILE_ZOOM) * size} // Fit tiles to map
          bounds={bounds} // Prevent Leaflet from requesting out-of-bounds tiles
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          minNativeZoom={MIN_TILE_ZOOM}
          maxNativeZoom={MAX_TILE_ZOOM}
          zoomOffset={-MIN_TILE_ZOOM}
        />
        {showGrid && <Grid mapSize={size} />}
        {children}
      </Map>
    );
  }
}

GameMap.propTypes = {
  map: DataPropTypes.map.isRequired,
  showGrid: PropTypes.bool,
  children: CommonPropTypes.children,
};

GameMap.defaultProps = {
  showGrid: false,
  children: [],
};

export default GameMap;
