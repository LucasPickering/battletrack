import palette from 'google-palette';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Panel, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AutoSizer } from 'react-virtualized';
import Slider from 'rc-slider';
import uniqid from 'uniqid';
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

    const { telemetry: { match: { duration, rosters } } } = props;

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
    palette('tol-rainbow', rosters.length).map(c => `#${c}`).forEach((color, index) => {
      this.rosterColors[rosters[index].id] = color;
    });
    Object.freeze(this.rosterColors);

    this.state = {
      timeRange: [0, duration], // Time range to display events in
      markFilters: Object.keys(DISPLAY_FILTERS), // Mark types to display
      enabledPlayers: Object.keys(this.playerToRoster), // All players enabled by default
    };

    this.markFilterEnabled = this.markFilterEnabled.bind(this);
  }

  getPlayerColor(player) {
    return player ? this.rosterColors[this.playerToRoster[player.id]] : null;
  }

  markFilterEnabled(markType) {
    return this.state.markFilters.includes(markType);
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
        onAfterChange={newRange => this.setState({ timeRange: newRange })}
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
        events,
      },
    } = this.props;
    const { timeRange: [minTime, maxTime], enabledPlayers } = this.state;
    const timeFilter = e => inRange(e.time, minTime, maxTime); // Used to filter events by time

    // Generate a big ol' list of every event-based mark that should be shown on the map
    const marks = Object.entries(EventMappers).reduce((acc, [eventType, mapper]) => {
      const filteredEvents = events[eventType].filter(timeFilter); // Filter events by time
      const markLists = Object.entries(mapper)
        .filter(([markType]) => this.markFilterEnabled(markType))
        .map(([, markObj]) => filteredEvents
          .map(markObj.generator) // Convert the list of events into a list of marks
          .filter(event => event) // Filter out null events
          // Filter by player. Some events have no player, so allow those through.
          .filter(({ player }) => !player || enabledPlayers.includes(player.id)));
      return acc.concat(...markLists); // Add each sublist to the acc
    }, []);

    return (
      <div className="map">
        <AutoSizer>
          {size => (
            <GameMap
              map={{ name: mapName, size: 8000 }} // Map size should be pulled from the API
              plane={this.markFilterEnabled('plane') ? plane : null}
              whiteZones={this.markFilterEnabled('zones') ? zones : []}
              {...size}
            >
              {marks.map(({ player, ...rest }) => React.createElement(EventMark, {
                key: uniqid(),
                color: this.getPlayerColor(player),
                player,
                ...rest,
              }))}
            </GameMap>
          )}
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
        <br />
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
