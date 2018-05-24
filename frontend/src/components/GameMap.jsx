import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ReactSVGPanZoom } from 'react-svg-pan-zoom';

import { mapImage } from '../util';
import Ray from './Ray';

class GameMap extends Component {
  componentDidMount() {
    this.viewer.fitToViewer(); // TODO: Make this work
  }

  render() {
    const {
      map: { name, size },
      plane,
      children,
      ...rest
    } = this.props;
    return (
      <ReactSVGPanZoom
        ref={viewer => { this.viewer = viewer; }}
        miniaturePosition="none"
        {...rest}
      >
        <svg width={size} height={size}>
          <image href={mapImage(name)} width={size} height={size} />
          {plane && <Ray {...plane} color="white" showTailTip /> }
          {children}
        </svg>
      </ReactSVGPanZoom>
    );
  }
}

GameMap.propTypes = {
  map: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
  }).isRequired,
  plane: PropTypes.shape({
    start: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
    end: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
  }),
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.any)]),
};

GameMap.defaultProps = {
  plane: null,
  children: [],
};

export default GameMap;
