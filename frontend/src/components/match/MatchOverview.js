import React from 'react';
import { Button } from 'react-bootstrap';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import BtPropTypes from 'util/BtPropTypes';
import {
  SpecialMarkTypes,
  EventMarkTypes,
  EventTypes,
  convertEvent,
} from 'util/MarkMappers';
import RosterPalette from 'util/RosterPalette';
import {
  formatSeconds,
  objectFilter,
  inRange,
  range,
} from 'util/funcs';
import 'styles/match/MatchOverview.css';

import Icon from '../Icon';
import OverviewDrawer from './OverviewDrawer';
import MarkedGameMap from '../map/MarkedGameMap';

const Range = Slider.createSliderWithTooltip(Slider.Range); // Janky AF

class MatchOverview extends React.PureComponent {
  constructor(props, ...args) {
    super(props, ...args);

    const {
      telemetry: {
        match: { duration, rosters },
        events,
      },
    } = props;

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
      drawerOpen: true,
      timeRange: [0, this.maxTime], // Time range to display events in
      // Put every special mark type, event mark type, and player ID in one list
      enabledFilters: [].concat(
        Object.keys(SpecialMarkTypes),
        Object.keys(EventMarkTypes),
        ...rosters.map(roster => roster.players.map(player => player.player_id)),
      ),
    };

    this.filterEnabled = this.filterEnabled.bind(this);
  }

  filterEnabled(key) {
    const { enabledFilters } = this.state;
    return enabledFilters.includes(key);
  }

  render() {
    const {
      match: {
        id,
        map,
        rosters,
      },
      telemetry: {
        plane,
        zones: whiteZones,
      },
    } = this.props;
    const { drawerOpen, timeRange, enabledFilters } = this.state;
    const [minTime, maxTime] = timeRange;

    // Build an object of special marks to display, but filter out ones that are disabled
    const specialMarks = objectFilter({ plane, whiteZones }, this.filterEnabled);

    // Filter marks by type/time/player and flatten them into one big list
    const eventMarks = [].concat(...Object.entries(this.eventMarks)
      .filter(([markType]) => this.filterEnabled(markType)) // Filter by type
      // Filter each mark list by time/player
      .map(([, markList]) => markList
        .filter(({ time }) => inRange(time, minTime, maxTime)) // Filter by time
        .filter(({ player }) => !player || this.filterEnabled(player.id)))); // Filter by player

    return (
      <div className="overview">
        {drawerOpen && (
          <OverviewDrawer
            matchId={id}
            rosters={rosters}
            rosterPalette={this.rosterPalette}
            enabledPlayers={enabledFilters}
            onChange={val => this.setState({ enabledFilters: val })}
          />
        )}

        <div className="map-container">
          <Button
            className="drawer-button"
            onClick={() => this.setState({ drawerOpen: !drawerOpen })}
          >
            <Icon name={drawerOpen ? 'chevron-left' : 'chevron-right'} />
          </Button>

          <Range
            className="time-range"
            count={1}
            max={this.maxTime}
            value={timeRange}
            onChange={newRange => this.setState({ timeRange: newRange })}
            marks={this.timeMarks}
            tipFormatter={formatSeconds}
          />

          <MarkedGameMap
            map={map}
            specialMarks={specialMarks}
            eventMarks={eventMarks}
            rosterPalette={this.rosterPalette}
            showGrid
          />
        </div>
      </div>
    );
  }
}

MatchOverview.propTypes = {
  match: BtPropTypes.match.isRequired,
  telemetry: BtPropTypes.match.isRequired,
};

export default MatchOverview;
