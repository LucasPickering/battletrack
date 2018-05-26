import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { AutoSizer } from 'react-virtualized';

import BtPropTypes from '../util/BtPropTypes';
import RosterPalette from '../util/RosterPalette';
import GameMap from './GameMap';
import EventMarks from './EventMarks';
import Ray from './Ray';
import Zones from './Zones';

class MarkedGameMap extends Component {
  constructor(props, ...args) {
    super(props, ...args);
    this.mapSize = 8000; // TODO: Replace this with data passed from the API
    this.state = {
      zoom: null,
    };
  }

  normalizeZoom(zoom, windowWidth, windowHeight) {
    return zoom / (Math.min(windowWidth, windowHeight) / this.mapSize);
  }

  denormalizeZoom(zoom, windowWidth, windowHeight) {
    return zoom * (Math.min(windowWidth, windowHeight) / this.mapSize);
  }

  render() {
    const {
      mapName,
      marks,
      rosterPalette,
      plane,
      whiteZones,
      lineScaleFactor,
      markScaleFactor,
      ...rest
    } = this.props;
    const { zoom } = this.state;

    const scale = zoom ? (1 / zoom) : 0;
    const lineScale = scale * lineScaleFactor;
    const markScale = scale * markScaleFactor;

    return (
      <div className="marked-game-map" style={{ display: 'flex' }}>
        <AutoSizer>
          {/* The size check is necessary to prevent weird double-rendering bugs. Trust me. */}
          {({ width, height }) => (width === 0 || height === 0 ? null : (
            <GameMap
              map={{ name: mapName, size: this.mapSize }}
              width={width}
              height={height}
              onZoom={zoomObj => this.setState({
                zoom: this.normalizeZoom(zoomObj.a, width, height),
              })}
              // If the min is too close to 1.0 it bugs out, so drop it a bit
              scaleFactorMin={this.denormalizeZoom(0.95, width, height)}
              {...rest}
            >
              {plane
                && <Ray {...plane} color="white" strokeWidth={lineScale * 1.5} showTailTip />}
              <Zones circles={whiteZones} stroke="#ffffff" strokeWidth={lineScale} />
              <EventMarks marks={marks} scale={markScale} rosterPalette={rosterPalette} />
            </GameMap>
          ))}
        </AutoSizer>
      </div>
    );
  }
}

MarkedGameMap.propTypes = {
  mapName: PropTypes.string.isRequired,
  marks: PropTypes.arrayOf(PropTypes.object).isRequired,
  rosterPalette: PropTypes.instanceOf(RosterPalette).isRequired,
  plane: BtPropTypes.ray,
  whiteZones: PropTypes.arrayOf(BtPropTypes.circle),
  lineScaleFactor: PropTypes.number,
  markScaleFactor: PropTypes.number,
};

MarkedGameMap.defaultProps = {
  plane: null,
  whiteZones: [],
  lineScaleFactor: 10,
  markScaleFactor: 10,
};

export default MarkedGameMap;
