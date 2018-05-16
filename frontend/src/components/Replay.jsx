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
      telemetry: null,
    };
  }

  componentWillMount() {
    // Load events from the API
    api.get(`/api/telemetry/${this.props.match.id}?events=PlayerKill`)
      .then(response => this.setState({ telemetry: response.data }))
      .catch(console.error);
  }

  render() {
    const { match: { map_name: mapName } } = this.props;
    const { telemetry } = this.state;
    return telemetry && (
      <svg
        width={MAP_SIZE_PIXELS}
        height={MAP_SIZE_PIXELS}
        viewBox={`0 0 ${MAP_SIZE_METERS} ${MAP_SIZE_METERS}`}
      >
        <image href={mapImage(mapName)} width="100%" height="100%" />

        {telemetry.zones
          .map(zone => <Zone key={uniqid()} circle={zone} stroke="#ffffff" />)}
        {telemetry.events.PlayerKill
          .map(e => <Circle key={uniqid()} pos={e.player.pos} fill="red" />)}
      </svg>
    );
  }
}

Replay.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Replay;
