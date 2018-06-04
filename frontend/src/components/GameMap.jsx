import PropTypes from 'prop-types';
import React from 'react';
import { ReactSVGPanZoom } from 'react-svg-pan-zoom';

import { mapImage } from '../util/funcs';
import BtPropTypes from '../util/BtPropTypes';

class GameMap extends React.PureComponent {
  componentDidMount() {
    this.viewer.fitToViewer();
  }

  render() {
    const {
      map: { name, size },
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
          {children}
        </svg>
      </ReactSVGPanZoom>
    );
  }
}

GameMap.propTypes = {
  map: BtPropTypes.map.isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.any)]),
};

GameMap.defaultProps = {
  children: [],
};

export default GameMap;
