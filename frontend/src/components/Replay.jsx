import PropTypes from 'prop-types';
import React, { Component } from 'react';
import uniqid from 'uniqid';

import api from '../api';
import { mapImage } from '../util';
import Circle from './Circle';
import Zone from './Zone';

const MAP_SIZE_METERS = 8000;
const MAP_SIZE_PIXELS = 800;

class Replay extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      events: null,
    };
  }

  componentWillMount() {
    // Load events from the API
    api.get(`/api/telemetry/${this.props.match.id}?events=GameStatePeriodic,PlayerPosition`)
      .then(response => this.setState({ events: response.data.events }))
      .catch(console.error);
  }

  render() {
    const { consts, match } = this.props;
    const { events } = this.state;
    return events && (
      <svg
        width={MAP_SIZE_PIXELS}
        height={MAP_SIZE_PIXELS}
        viewBox={`0 0 ${MAP_SIZE_METERS} ${MAP_SIZE_METERS}`}
      >
        <image href={mapImage(consts.maps[match.map_name])} width="100%" height="100%" />

        {events.GameStatePeriodic
          .filter(e => e.white_zone)
          .map(e => <Zone key={uniqid()} circle={e.white_zone} stroke="#ffffff" />)}
        {events.PlayerPosition
          .map(e => <Circle key={uniqid()} pos={e.player.pos} fill="red" />)}
      </svg>
    );
  }
}

Replay.propTypes = {
  consts: PropTypes.objectOf(PropTypes.object).isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Replay;
