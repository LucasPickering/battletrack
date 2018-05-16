import PropTypes from 'prop-types';
import React, { Component } from 'react';
import uniqid from 'uniqid';

import { mapImage } from '../util';
import ApiComponent from './ApiComponent';
import Circle from './Circle';
import Zone from './Zone';

const MAP_SIZE_METERS = 8000;
const MAP_SIZE_PIXELS = 800;

class Replay extends Component {
  constructor(props, context) {
    super(props, context);
    this.renderSvg = this.renderSvg.bind(this);
  }

  renderSvg(telemetry) {
    const { matchData: { map_name: mapName } } = this.props;
    return (
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

  render() {
    return (
      <ApiComponent
        url={`/api/telemetry/${this.props.matchData.id}?events=PlayerKill`}
        render={this.renderSvg}
      />
    );
  }
}

Replay.propTypes = {
  matchData: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Replay;
