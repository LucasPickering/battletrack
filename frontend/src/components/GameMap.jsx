import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ReactSVGPanZoom } from 'react-svg-pan-zoom';
import uniqid from 'uniqid';

import { mapImage } from '../util/funcs';
import BtPropTypes from '../util/BtPropTypes';
import Ray from './Ray';
import Zone from './Zone';

class GameMap extends Component {
  componentDidMount() {
    this.viewer.fitToViewer();
  }

  render() {
    const {
      map: { name, size },
      plane,
      blueZones,
      whiteZones,
      children,
      ...rest
    } = this.props;
    return (
      <ReactSVGPanZoom
        className="game-map"
        ref={viewer => { this.viewer = viewer; }}
        miniaturePosition="none"
        detectAutoPan={false}
        {...rest}
      >
        <svg width={size} height={size}>
          <image href={mapImage(name)} width={size} height={size} />
          {plane && <Ray {...plane} color="white" showTailTip /> }
          {blueZones.map(zone => <Zone key={uniqid()} circle={zone} stroke="#0000ff" />)}
          {whiteZones.map(zone => <Zone key={uniqid()} circle={zone} stroke="#ffffff" />)}
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
  plane: BtPropTypes.ray,
  blueZones: PropTypes.arrayOf(BtPropTypes.circle),
  whiteZones: PropTypes.arrayOf(BtPropTypes.circle),
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.any)]),
};

GameMap.defaultProps = {
  plane: null,
  blueZones: [],
  whiteZones: [],
  children: [],
};

export default GameMap;
