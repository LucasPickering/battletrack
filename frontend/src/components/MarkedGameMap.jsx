import PropTypes from 'prop-types';
import React from 'react';
import { AutoSizer } from 'react-virtualized';
import uniqid from 'uniqid';

import BtPropTypes from '../util/BtPropTypes';
import Localization from '../util/Localization';
import { SpecialMarkTypes } from '../util/MarkMappers';
import RosterPalette from '../util/RosterPalette';
import GameMap from './GameMap';
import EventMarks from './EventMarks';
import MarkTooltip from './MarkTooltip';

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
      specialMarks,
      eventMarks,
      rosterPalette,
      lineScaleFactor,
      markScaleFactor,
      children,
      ...rest
    } = this.props;
    const { zoom, selectedMark } = this.state;

    const scale = zoom ? (1 / zoom) : 0;
    const specialMarkProps = { lineScale: scale * lineScaleFactor };

    return (
      <div className="marked-game-map">
        <AutoSizer>
          {/* The size check is necessary to prevent weird double-rendering bugs. Trust me. */}
          {({ width, height }) => (width === 0 || height === 0 ? null : (
            <GameMap
              width={width}
              height={height}
              onZoom={zoomObj => this.setState({
                zoom: this.normalizeZoom(zoomObj.a, width, height),
              })}
              // If the min is too close to 1.0 it bugs out, so drop it a bit
              scaleFactorMin={this.denormalizeZoom(0.95, width, height)}
              {...rest}
            >
              {Object.entries(specialMarks)
                .map(([markType, markData]) => SpecialMarkTypes[markType].render(markData, {
                  key: uniqid(),
                  ...specialMarkProps,
                }))}
              <EventMarks
                marks={eventMarks}
                scale={scale * markScaleFactor}
                rosterPalette={rosterPalette}
                onMarkSelect={mark => this.setState({ selectedMark: mark })}
              />
            </GameMap>
          ))}
        </AutoSizer>
        {selectedMark &&
          <MarkTooltip
            style={{ position: 'absolute', top: 40 }}
            title={Localization.eventMarks[selectedMark.type].single}
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
  specialMarks: PropTypes.objectOf(PropTypes.any).isRequired,
  eventMarks: PropTypes.arrayOf(PropTypes.object).isRequired,
  rosterPalette: PropTypes.instanceOf(RosterPalette).isRequired,
  lineScaleFactor: PropTypes.number,
  markScaleFactor: PropTypes.number,
  children: BtPropTypes.children,
};

MarkedGameMap.defaultProps = {
  lineScaleFactor: 10,
  markScaleFactor: 10,
  children: null,
};

export default MarkedGameMap;
