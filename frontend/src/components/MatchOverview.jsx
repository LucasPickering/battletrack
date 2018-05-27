import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Panel, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { MarkTypes, EventTypes, convertEvent } from '../util/EventMappers';
import RosterPalette from '../util/RosterPalette';
import {
  formatSeconds,
  matchLink,
  inRange,
  range,
} from '../util/funcs';
import ApiComponent from './ApiComponent';
import RosterCheckList from './RosterCheckList';
import MarkedGameMap from './MarkedGameMap';
import '../styles/MatchOverview.css';

const Range = Slider.createSliderWithTooltip(Slider.Range); // Janky AF

const DISPLAY_FILTERS = Object.freeze({
  plane: 'Plane',
  zones: 'Play Zones',
  // Convert each mark type into a field in the object
  ...Object.entries(MarkTypes).reduce((acc, [type, { labels: { plural } }]) => {
    acc[type] = plural;
    return acc;
  }, {}),
});

class MatchOverviewHelper extends Component {
  constructor(props, ...args) {
    super(props, ...args);

    const { telemetry: { match: { duration, rosters }, events } } = props;

    this.rosterPalette = new RosterPalette(rosters); // This creates a color for each roster

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
    // Filtering on time/type/player is based on state so that will be done during render.
    this.marks = Object.entries(EventTypes).reduce((acc, [eventType, markTypes]) => {
      const eventsForType = events[eventType];
      markTypes.forEach(markType => {
        acc[markType] = eventsForType
          .map(event => convertEvent(markType, event)) // Convert the event to a mark
          .filter(mark => mark); // Filter out null marks
      });
      return acc;
    }, {});
    Object.freeze(this.marks);

    this.state = {
      timeRange: [0, duration], // Time range to display events in
      markFilters: Object.keys(DISPLAY_FILTERS), // Mark types to display
      // Extract every player ID from the list of rosters into a big flat list
      enabledPlayers: rosters.reduce(
        (acc, roster) => {
          roster.players.forEach(player => acc.push(player.player_id));
          return acc;
        },
        [],
      ),
    };

    this.markFilterEnabled = this.markFilterEnabled.bind(this);
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
          rosterPalette={this.rosterPalette}
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
      <MarkedGameMap
        mapName={mapName}
        marks={marks}
        rosterPalette={this.rosterPalette}
        plane={this.markFilterEnabled('plane') ? plane : undefined}
        whiteZones={this.markFilterEnabled('zones') ? zones : undefined}
      />
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
    url={`/api/telemetry/${matchId}?events=${Object.keys(EventTypes).join()}`}
    component={MatchOverviewHelper}
    dataProp="telemetry"
    matchId={matchId}
  />
);

MatchOverview.propTypes = {
  matchId: PropTypes.string.isRequired,
};

export default MatchOverview;
