import PropTypes from 'prop-types';
import React from 'react';
import { AutoSizer } from 'react-virtualized';
import uniqid from 'uniqid';

import BtPropTypes from '../util/BtPropTypes';
import Localization from '../util/Localization';
import RosterPalette from '../util/RosterPalette';
import GameMap from './GameMap';
import EventMarks from './EventMarks';
import MarkTooltip from './MarkTooltip';
import Ray from './Ray';
import Zones from './Zones';

class MarkedGameMap extends React.PureComponent {
  constructor(props, ...args) {
    super(props, ...args);
    this.mapSize = 8000; // TODO: Replace this with data passed from the API
    this.state = {
      zoom: null,
      selectedMark: null,
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
      children,
      ...rest
    } = this.props;
    const { zoom, selectedMark } = this.state;

    const scale = zoom ? (1 / zoom) : 0;
    const lineScale = scale * lineScaleFactor;
    const markScale = scale * markScaleFactor;

    return (
      <div className="marked-game-map">
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
              <EventMarks
                marks={marks}
                scale={markScale}
                rosterPalette={rosterPalette}
                onMarkSelect={mark => this.setState({ selectedMark: mark })}
              />
            </GameMap>
          ))}
        </AutoSizer>
        {selectedMark &&
          <MarkTooltip
            style={{ position: 'absolute', top: 40 }}
            title={Localization.marks[selectedMark.type].single}
            time={selectedMark.time}
            text={selectedMark.tooltip}
          />
        }
        {children}
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
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
};

MarkedGameMap.defaultProps = {
  plane: null,
  whiteZones: [],
  lineScaleFactor: 10,
  markScaleFactor: 10,
  children: null,
};

export default MarkedGameMap;
