import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import Slider from 'rc-slider';
import uniqid from 'uniqid';
import 'rc-slider/assets/index.css';

import {
  formatSeconds,
  mapImage,
  range,
} from '../util';
import ApiComponent from './ApiComponent';
import Ray from './Ray';
import Circle from './Circle';
import Zone from './Zone';
import '../styles/Replay.css';

const Range = Slider.createSliderWithTooltip(Slider.Range); // Janky AF

const MAP_SIZE_METERS = 8000;
const MAP_SIZE_PIXELS = 800;

class Replay extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      timeRange: [0, props.matchData.duration],
    };

    this.renderReplay = this.renderReplay.bind(this);
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

  renderSvg(telemetry) {
    const { matchData: { map_name: mapName } } = this.props;
    const { timeRange: [minTime, maxTime] } = this.state;
    const { plane, zones, events } = telemetry;

    return (
      <svg
        width={MAP_SIZE_PIXELS}
        height={MAP_SIZE_PIXELS}
        viewBox={`0 0 ${MAP_SIZE_METERS} ${MAP_SIZE_METERS}`}
      >
        <image href={mapImage(mapName)} width="100%" height="100%" />

        <Ray start={plane.start} end={plane.end} stroke="red" strokeWidth={10} />
        {zones.map(zone => <Zone key={uniqid()} circle={zone} stroke="#ffffff" />)}
        {events.PlayerKill
          .filter(e => minTime <= e.time && e.time <= maxTime)
          .map(e => <Circle key={uniqid()} pos={e.player.pos} fill="red" />)}
      </svg>
    );
  }

  renderReplay(telemetry) {
    return (
      <Panel className="replay">
        {this.renderTimeRange()}
        {this.renderSvg(telemetry)}
      </Panel>
    );
  }

  render() {
    return (
      <ApiComponent
        url={`/api/telemetry/${this.props.matchData.id}?events=PlayerKill`}
        render={this.renderReplay}
      />
    );
  }
}

Replay.propTypes = {
  matchData: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Replay;
