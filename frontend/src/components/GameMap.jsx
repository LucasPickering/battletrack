import PropTypes from 'prop-types';
import React from 'react';
import { ReactSVGPanZoom } from 'react-svg-pan-zoom';

import { mapImage, range } from '../util/funcs';
import BtPropTypes from '../util/BtPropTypes';

const GRID_SMALL_STEP = 100;
const GRID_LARGE_STEP = 1000;

const GridLine = ({
  d,
  mapSize,
  major,
  vertical,
  ...rest
}) => (
  <path
    d={vertical ? `M${d},0 V${mapSize} Z` : `M0,${d} H${mapSize} Z`}
    stroke={major ? '#444' : '#999'}
    strokeWidth={major ? 6 : 1}
    {...rest}
  />
);

GridLine.propTypes = {
  d: PropTypes.number.isRequired,
  mapSize: PropTypes.number.isRequired,
  major: PropTypes.bool,
  vertical: PropTypes.bool,
};

GridLine.defaultProps = {
  major: false,
  vertical: false,
};

class GameMap extends React.PureComponent {
  componentDidMount() {
    this.viewer.fitToViewer();
  }

  renderGrid() {
    const { size } = this.props.map;
    const lines = range(GRID_SMALL_STEP, size, GRID_SMALL_STEP);
    return lines.map(d => {
      const major = (d % GRID_LARGE_STEP === 0);
      return (
        <g>
          <GridLine d={d} mapSize={size} major={major} />
          <GridLine d={d} mapSize={size} major={major} vertical />
        </g>
      );
    });
  }

  render() {
    const {
      map: { name, size },
      showGrid,
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
          {showGrid && this.renderGrid()}
          {children}
        </svg>
      </ReactSVGPanZoom>
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
