import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { mapImage } from '../util';

const MAP_SIZE_METERS = 8000;
const MAP_SIZE_PIXELS = 800;

// eslint-disable-next-line react/prefer-stateless-function
class GameMap extends Component {
  render() {
    const { mapName, children } = this.props;
    return (
      <svg
        width={MAP_SIZE_PIXELS}
        height={MAP_SIZE_PIXELS}
        viewBox={`0 0 ${MAP_SIZE_METERS} ${MAP_SIZE_METERS}`}
      >
        <image href={mapImage(mapName)} width="100%" height="100%" />

        {children}
      </svg>
    );
  }
}

GameMap.propTypes = {
  mapName: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.any)]),
};

GameMap.defaultProps = {
  children: [],
};

export default GameMap;
