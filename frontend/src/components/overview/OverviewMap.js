import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import BtPropTypes from 'util/BtPropTypes';
import {
  objectFilter,
  inRange,
} from 'util/funcs';
import {
  EventTypes,
  convertEvent,
} from 'util/MarkMappers';

import MarkedGameMap from 'components/map/MarkedGameMap';
import 'styles/overview/OverviewMap.css';

class OverviewMap extends React.PureComponent {
  constructor(...args) {
    super(...args);

    const {
      telemetry: {
        events,
      },
    } = this.props;

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

    this.filterEnabled = this.filterEnabled.bind(this);
  }

  filterEnabled(key) {
    const { enabledFilters } = this.props;
    return enabledFilters.includes(key);
  }

  render() {
    const {
      map,
      telemetry: {
        plane,
        zones: whiteZones,
      },
      rosterPalette,
      timeRange: [minTime, maxTime],
    } = this.props;

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
      <MarkedGameMap
        map={map}
        specialMarks={specialMarks}
        eventMarks={eventMarks}
        rosterPalette={rosterPalette}
        showGrid
      />
    );
  }
}

OverviewMap.propTypes = {
  // Redux state
  map: BtPropTypes.map.isRequired,
  telemetry: BtPropTypes.telemetry.isRequired,
  rosterPalette: BtPropTypes.rosterPalette.isRequired,
  enabledFilters: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  timeRange: BtPropTypes.timeRange.isRequired,
};

const mapStateToProps = state => ({
  map: state.api.match.data.map,
  telemetry: state.api.telemetry.data,
  rosterPalette: state.overview.rosterPalette,
  enabledFilters: state.overview.enabledFilters,
  timeRange: state.overview.timeRange,
});

export default connect(mapStateToProps)(OverviewMap);
