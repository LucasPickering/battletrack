import React from 'react';
import { flatten, pick } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DataPropTypes from 'proptypes/DataPropTypes';
import MapPropTypes from 'proptypes/MapPropTypes';
import {
  inRangeIncl,
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
  }

  render() {
    const {
      enabledFilters,
      map,
      telemetry: {
        plane,
        zones: whiteZones,
      },
      rosterPalette,
      timeRange: [minTime, maxTime],
    } = this.props;

    // Build an object of special marks to display, but filter out ones that are disabled
    const specialMarks = pick({ plane, whiteZones }, enabledFilters);

    // Filter marks by type/time/player and flatten them into one big list
    const filteredByType = pick(this.eventMarks, enabledFilters); // Filter by type
    const eventMarks = flatten(Object.values(filteredByType)
      // Filter each mark list by time/player
      .map(markList => markList
        .filter(({ time }) => inRangeIncl(time, minTime, maxTime)) // Filter by time
        .filter(({ player }) => !player || enabledFilters.includes(player.id)))); // And by player

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
  map: DataPropTypes.map.isRequired,
  telemetry: DataPropTypes.telemetry.isRequired,
  rosterPalette: MapPropTypes.rosterPalette.isRequired,
  enabledFilters: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  timeRange: MapPropTypes.timeRange.isRequired,
};

const mapStateToProps = state => ({
  map: state.api.match.data.map,
  telemetry: state.api.telemetry.data,
  rosterPalette: state.overview.rosterPalette,
  enabledFilters: state.overview.enabledFilters,
  timeRange: state.overview.timeRange,
});

export default connect(mapStateToProps)(OverviewMap);
