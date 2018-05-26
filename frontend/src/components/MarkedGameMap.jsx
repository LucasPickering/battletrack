import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { AutoSizer } from 'react-virtualized';
import uniqid from 'uniqid';

import BtPropTypes from '../util/BtPropTypes';
import RosterPalette from '../util/RosterPalette';
import GameMap from './GameMap';
import EventMark from './EventMark';
import Ray from './Ray';
import Zone from './Zone';
import '../styles/MatchOverview.css';

class MarkedGameMap extends Component {
  constructor(props, ...args) {
    super(props, ...args);
    this.mapSize = 8000; // TODO: Replace this with data passed from the API
    this.state = {
      zoom: 0,
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
      markScaleFactor,
      ...rest
    } = this.props;
    const { zoom } = this.state;
    const markScale = zoom > 0 ? (markScaleFactor / zoom) : 1;

    return (
      <div className="map">
        <AutoSizer>
          {/* The size check is necessary to prevent weird double-rendering bugs. Trust me. */}
          {({ width, height }) => (width === 0 || height === 0 ? null : (
            <GameMap
              map={{ name: mapName, size: this.mapSize }} // Map size should be pulled from the API
              width={width}
              height={height}
              onZoom={zoomObj => this.setState({
                zoom: this.normalizeZoom(zoomObj.a, width, height),
              })}
              // If the min is too close to 1.0 it bugs out, so drop it a bit
              scaleFactorMin={this.denormalizeZoom(0.95, width, height)}
              {...rest}
            >
              {plane && <Ray {...plane} color="white" showTailTip /> }
              {whiteZones.map(zone => (
                <Zone key={uniqid()} circle={zone} stroke="#ffffff" strokeWidth={markScale * 2} />
              ))}
              {marks.map(({
                id,
                player,
                time,
                ...markRest
              }) => React.createElement(EventMark, {
                key: id,
                color: player ? rosterPalette.getPlayerColor(player.id) : undefined,
                time,
                player,
                scale: markScale,
                ...markRest,
              }))}
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
  markScaleFactor: PropTypes.number,
};

MarkedGameMap.defaultProps = {
  plane: null,
  whiteZones: [],
  markScaleFactor: 7,
};

export default MarkedGameMap;
