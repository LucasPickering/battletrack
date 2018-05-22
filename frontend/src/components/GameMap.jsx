import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { mapImage } from '../util';

const MAP_SIZE_METERS = 8000;

// eslint-disable-next-line react/prefer-stateless-function
class GameMap extends Component {
  render() {
    const { mapName, children, ...rest } = this.props;
    return (
      <svg
        viewBox={`0 0 ${MAP_SIZE_METERS} ${MAP_SIZE_METERS}`}
        {...rest}
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
