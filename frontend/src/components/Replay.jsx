import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Panel, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import Slider from 'rc-slider';
import uniqid from 'uniqid';
import 'rc-slider/assets/index.css';

import {
  formatSeconds,
  mapImage,
  inRange,
  range,
} from '../util';
import ApiComponent from './ApiComponent';
import Ray from './Ray';
import KillEvent from './KillEvent';
import CarePackageEvent from './CarePackageEvent';
import Zone from './Zone';
import '../styles/Replay.css';

const Range = Slider.createSliderWithTooltip(Slider.Range); // Janky AF

const MAP_SIZE_METERS = 8000;
const MAP_SIZE_PIXELS = 800;

const DISPLAY_FILTERS = [
  'Circles',
  'Plane',
  'Kills',
  'Deaths',
  'Care Packages',
];

const EVENT_TYPES = Object.freeze({
  PlayerKill: { component: KillEvent, filters: ['Kills', 'Deaths'] },
  CarePackageLand: { component: CarePackageEvent, filters: ['Care Packages'] },
});

class Replay extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      timeRange: [0, props.matchData.duration], // Time range to display events in
      displayFilters: DISPLAY_FILTERS.slice(), // Copy the array
      // eventTypes: Object.keys(EVENT_TYPES), // Event types to display
    };

    this.displayFilterEnabled = this.displayFilterEnabled.bind(this);
    this.renderReplay = this.renderReplay.bind(this);
  }

  displayFilterEnabled(filterName) {
    return this.state.displayFilters.includes(filterName);
  }

  renderTimeRange() {
    const { matchData: { duration } } = this.props;
    const { timeRange } = this.state;

    // Build an object of marks to put on the slider
    const marks = {};
    range(0, duration, 300).forEach(i => {
      marks[i] = formatSeconds(i, 'm[m]');
    });
    marks[duration] = formatSeconds(duration); // Add the final mark

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
    const { displayFilters } = this.state;
    return (
      <ToggleButtonGroup
        type="checkbox"
        value={displayFilters}
        onChange={val => this.setState({ displayFilters: val })}
      >
        {DISPLAY_FILTERS.map(e => (
          <ToggleButton key={e} value={e}>{e}</ToggleButton>
        ))}
      </ToggleButtonGroup>
    );
  }

  renderSvg(telemetry) {
    const { matchData: { map_name: mapName } } = this.props;
    const { timeRange: [minTime, maxTime] } = this.state;
    const { plane, zones, events } = telemetry;
    const timeFilter = e => inRange(e.time, minTime, maxTime); // Used to filter events by time

    return (
      <svg
        width={MAP_SIZE_PIXELS}
        height={MAP_SIZE_PIXELS}
        viewBox={`0 0 ${MAP_SIZE_METERS} ${MAP_SIZE_METERS}`}
      >
        <image href={mapImage(mapName)} width="100%" height="100%" />

        {this.displayFilterEnabled('Plane') &&
          <Ray start={plane.start} end={plane.end} stroke="red" strokeWidth={10} />}
        {this.displayFilterEnabled('Circles') &&
          zones.map(zone => <Zone key={uniqid()} circle={zone} stroke="#ffffff" />)}

        {Object.entries(EVENT_TYPES).map(([type, v]) => {
          const { component, filters: componentFilters } = v;
          // Figure out which filter buttons relevant to this event are enabled
          const enabledFilters = componentFilters.filter(this.displayFilterEnabled);

          // If any of the relevant filters are enabled, render all the objects
          if (enabledFilters.length > 0) {
            return events[type]
              .filter(timeFilter) // Filter by time
              .map(event => React.createElement(
                component,
                { key: uniqid(), event, filters: enabledFilters },
              ));
          }
          return null; // Nothing to render
        })}
      </svg>
    );
  }

  renderReplay(telemetry) {
    return (
      <Panel className="replay">
        {this.renderTimeRange()}
        {this.renderFilterButtons()}
        <br />
        {this.renderSvg(telemetry)}
      </Panel>
    );
  }

  render() {
    const eventTypes = Object.keys(EVENT_TYPES).join();
    return (
      <ApiComponent
        url={`/api/telemetry/${this.props.matchData.id}?events=${eventTypes}`}
        render={this.renderReplay}
      />
    );
  }
}

Replay.propTypes = {
  matchData: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Replay;
