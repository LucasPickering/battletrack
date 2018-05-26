import palette from 'google-palette';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Panel, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AutoSizer } from 'react-virtualized';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import {
  formatSeconds,
  matchLink,
  inRange,
  range,
} from '../util';
import EventMappers from '../EventMappers';
import ApiComponent from './ApiComponent';
import RosterCheckList from './RosterCheckList';
import GameMap from './GameMap';
import EventMark from './EventMark';
import '../styles/MatchOverview.css';

const Range = Slider.createSliderWithTooltip(Slider.Range); // Janky AF

const DISPLAY_FILTERS = Object.freeze({
  plane: 'Plane',
  zones: 'Play Zones',
  // Pull every mark type from the event mappers and add a button for it
  ...Object.values(EventMappers).reduce((acc, marks) => {
    Object.entries(marks).forEach(([type, { label }]) => { acc[type] = label; });
    return acc;
  }, {}),
});

class MatchOverviewHelper extends Component {
  constructor(props, ...args) {
    super(props, ...args);

    const { telemetry: { match: { duration, rosters }, events } } = props;

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

    // Convert events to marks. Each event can become one or more mark. Events look like:
    // {
    //   EventType1: [e1, e2, ...],
    //   ...
    // }
    // Marks will be an object of MarkType:list, containing all marks that might be displayed.
    // {
    //   MarkType1: [m1, m2, ...],
    //   ...
    // }
    // Filtering based on time/type/player is based on state so that will be done during render.
    this.marks = Object.entries(EventMappers).reduce((acc, [eventType, mapper]) => {
      const eventsForType = events[eventType];
      // This event type has 1+ mark types. Add a list entry in the acc for each mark type.
      Object.entries(mapper)
        .forEach(([markType, markTypeObj]) => {
          acc[markType] = eventsForType
            .map(markTypeObj.generator) // Convert the list of events into a list of marks
            .filter(mark => mark); // Filter out null marks
        });
      return acc;
    }, {});
    Object.freeze(this.marks);

    this.state = {
      timeRange: [0, duration], // Time range to display events in
      markFilters: Object.keys(DISPLAY_FILTERS), // Mark types to display
      enabledPlayers: Object.keys(this.playerToRoster), // All players enabled by default
    };

    this.markFilterEnabled = this.markFilterEnabled.bind(this);
  }

  getPlayerColor(player) {
    return this.rosterColors[this.playerToRoster[player.id]];
  }

  markFilterEnabled(markType) {
    return this.state.markFilters.includes(markType);
  }

  playerEnabled(playerId) {
    return this.state.enabledPlayers.includes(playerId);
  }

  renderTimeRange() {
    const { telemetry: { match: { duration } } } = this.props;
    const { timeRange } = this.state;

    // Build an object of marks to put on the slider
    const marks = {};
    range(0, duration, 300).forEach(i => {
      marks[i] = formatSeconds(i, 'm[m]');
    });
    marks[duration] = formatSeconds(duration, 'm[m]'); // Add the final mark

    return (
      <Range
        count={1}
        max={duration}
        defaultValue={timeRange}
        onChange={newRange => this.setState({ timeRange: newRange })}
        allowCross={false}
        marks={marks}
        tipFormatter={formatSeconds}
      />
    );
  }

  renderFilterButtons() {
    const { markFilters } = this.state;
    return (
      <ToggleButtonGroup
        className="filter-buttons"
        type="checkbox"
        value={markFilters}
        onChange={val => this.setState({ markFilters: val })}
      >
        {Object.entries(DISPLAY_FILTERS).map(([key, label]) => (
          <ToggleButton key={key} value={key}>{label}</ToggleButton>
        ))}
      </ToggleButtonGroup>
    );
  }

  renderPlayerList() {
    const { telemetry: { match: { rosters } } } = this.props;
    const { enabledPlayers } = this.state;
    return (
      <Panel className="player-list">
        <RosterCheckList
          rosters={rosters}
          rosterColors={this.rosterColors}
          enabledPlayers={enabledPlayers}
          onChange={val => this.setState({ enabledPlayers: val })}
        />
      </Panel>
    );
  }

  renderMap() {
    const {
      telemetry: {
        match: { map_name: mapName },
        plane,
        zones,
      },
    } = this.props;
    const { timeRange: [minTime, maxTime] } = this.state;

    // Filter marks by type/time/player and flatten them into one big list
    const marks = Object.entries(this.marks)
      .filter(([markType]) => this.markFilterEnabled(markType))
      .reduce(
        // Filter list of marks, then add remaining ones to the master list
        (acc, [, markList]) => acc.concat(markList
          .filter(({ time }) => inRange(time, minTime, maxTime)) // Filter by time
          .filter(({ player }) => !player || this.playerEnabled(player.id))), // Filter by player
        [], // Initial acc
      );

    return (
      <div className="map">
        <AutoSizer>
          {/* The size check is necessary to prevent weird double-rendering bugs. Trust me. */}
          {({ width, height }) => (width === 0 || height === 0 ? null : (
            <GameMap
              map={{ name: mapName, size: 8000 }} // Map size should be pulled from the API
              plane={this.markFilterEnabled('plane') ? plane : undefined}
              whiteZones={this.markFilterEnabled('zones') ? zones : undefined}
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
                color: player ? this.getPlayerColor(player) : undefined,
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

  render() {
    const { matchId } = this.props;
    return (
      <div className="overview">
        <Link className="match-link" to={matchLink(matchId)}><h3>Back to Match</h3></Link>
        {this.renderFilterButtons()}
        {this.renderTimeRange()}
        {this.renderPlayerList()}
        {this.renderMap()}
      </div>
    );
  }
}

MatchOverviewHelper.propTypes = {
  matchId: PropTypes.string.isRequired,
  telemetry: PropTypes.objectOf(PropTypes.any).isRequired,
};

const MatchOverview = ({ matchId }) => (
  <ApiComponent
    url={`/api/telemetry/${matchId}?events=${Object.keys(EventMappers).join()}`}
    component={MatchOverviewHelper}
    dataProp="telemetry"
    matchId={matchId}
  />
);

MatchOverview.propTypes = {
  matchId: PropTypes.string.isRequired,
};

export default MatchOverview;
