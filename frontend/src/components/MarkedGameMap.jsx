import palette from 'google-palette';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { AutoSizer } from 'react-virtualized';

import RosterPalette from '../util/RosterPalette';
import GameMap from './GameMap';
import EventMark from './EventMark';
import '../styles/MatchOverview.css';

class MarkedGameMap extends Component {
  constructor(props, ...args) {
    super(props, ...args);

    const { telemetry: { match: { rosters } }, rosterColorsRef } = props;

    // Build an object of playerID:rosterID
    this.playerToRoster = rosters.reduce(
      (acc, { id, players }) => {
        players.forEach(player => { acc[player.player_id] = id; });
        return acc;
      },
      {},
    );
    Object.freeze(this.playerToRoster);

    // Generate a color palette, with one color per roster
    this.rosterColors = {};
    palette('rainbow', rosters.length, 0, 0.7, 1.0) // Set saturation/value manually
      .map(c => `#${c}`).forEach((color, index) => {
        this.rosterColors[rosters[index].id] = color;
      });
    Object.freeze(this.rosterColors);

    // If a ref function was given, pass rosterColors to it
    if (rosterColorsRef) {
      rosterColorsRef(this.rosterColors);
    }
  }

  render() {
    const {
      telemetry: {
        match: { map_name: mapName },
        plane,
        zones,
      },
      marks,
      rosterPalette,
      showPlane,
      showWhiteZones,
    } = this.props;

    return (
      <div className="map">
        <AutoSizer>
          {/* The size check is necessary to prevent weird double-rendering bugs. Trust me. */}
          {({ width, height }) => (width === 0 || height === 0 ? null : (
            <GameMap
              map={{ name: mapName, size: 8000 }} // Map size should be pulled from the API
              plane={showPlane ? plane : undefined}
              whiteZones={showWhiteZones ? zones : undefined}
              width={width}
              height={height}
            >
              {marks.map(({
                id,
                player,
                time,
                ...rest
              }) => React.createElement(EventMark, {
                key: id,
                color: player ? rosterPalette.getPlayerColor(player.id) : undefined,
                time,
                player,
                ...rest,
              }))}
            </GameMap>
          ))}
        </AutoSizer>
      </div>
    );
  }
}

MarkedGameMap.propTypes = {
  telemetry: PropTypes.objectOf(PropTypes.any).isRequired,
  marks: PropTypes.arrayOf(PropTypes.object).isRequired,
  rosterPalette: PropTypes.instanceOf(RosterPalette).isRequired,
  rosterColorsRef: PropTypes.func,
  showPlane: PropTypes.bool,
  showWhiteZones: PropTypes.bool,
};

MarkedGameMap.defaultProps = {
  rosterColorsRef: null,
  showPlane: false,
  showWhiteZones: false,
};

export default MarkedGameMap;
