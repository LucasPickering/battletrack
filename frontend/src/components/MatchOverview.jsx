import PropTypes from 'prop-types';
import React from 'react';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import {
  RegularMarkTypes,
  EventMarkTypes,
  EventTypes,
  convertEvent,
} from '../util/MarkMappers';
import Localization from '../util/Localization';
import RosterPalette from '../util/RosterPalette';
import {
  formatSeconds,
  objectMap,
  objectFilter,
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
  // Convert each mark type into a field in the object
  ...objectMap(RegularMarkTypes, (_, markObj) => markObj.label),
  ...objectMap(EventMarkTypes, markType => Localization.marks[markType].plural),
});

class MatchOverviewHelper extends React.PureComponent {
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
    this.eventMarks = Object.entries(EventTypes).reduce((acc, [eventType, markTypes]) => {
      const eventsForType = events[eventType];
      markTypes.forEach(markType => {
        acc[markType] = eventsForType
          .map(event => convertEvent(markType, event)) // Convert the event to a mark
          .filter(mark => mark); // Filter out null marks
      });
      return acc;
    }, {});
    Object.freeze(this.eventMarks);

    // Sometimes the final event(s) of a match can take place after the duration, e.g. the duration
    // is 1906 but the final kill occurs at 1906.1. Add one to make sure we capture every event.
    this.maxTime = duration + 1;

    // Build an object of marks to put on the time slider
    this.timeMarks = {};
    range(0, this.maxTime, 5 * 60).forEach(i => {
      this.timeMarks[i] = formatSeconds(i, 'm[m]');
    });
    this.timeMarks[this.maxTime] = formatSeconds(this.maxTime, 'm[m]'); // Add the final mark

    this.state = {
      timeRange: [0, this.maxTime], // Time range to display events in
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

  render() {
    const {
      matchId,
      telemetry: {
        match: { map_name: mapName, rosters },
        plane,
        zones: whiteZones,
      },
    } = this.props;
    const { timeRange, enabledPlayers, markFilters } = this.state;
    const [minTime, maxTime] = timeRange;

    // Build an object of regular marks to display, but filter out ones that are disabled
    const regularMarks = objectFilter({ plane, whiteZones }, this.markFilterEnabled);

    // Filter marks by type/time/player and flatten them into one big list
    const eventMarks = [].concat(...Object.entries(this.eventMarks)
      .filter(([markType]) => this.markFilterEnabled(markType)) // Filter by type
      // Filter each mark list by time/player
      .map(([, markList]) => markList
        .filter(({ time }) => inRange(time, minTime, maxTime)) // Filter by time
        .filter(({ player }) => !player || this.playerEnabled(player.id)))); // Filter by player

    return (
      <div className="overview">
        <Link className="match-link" to={matchLink(matchId)}><h3>Back to Match</h3></Link>

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

        <RosterCheckList
          rosters={rosters}
          rosterPalette={this.rosterPalette}
          enabledPlayers={enabledPlayers}
          onChange={val => this.setState({ enabledPlayers: val })}
        />

        <MarkedGameMap
          mapName={mapName}
          regularMarks={regularMarks}
          eventMarks={eventMarks}
          rosterPalette={this.rosterPalette}
        >
          <Range
            count={1}
            max={this.maxTime}
            value={timeRange}
            onChange={newRange => this.setState({ timeRange: newRange })}
            marks={this.timeMarks}
            tipFormatter={formatSeconds}
          />
        </MarkedGameMap>
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
