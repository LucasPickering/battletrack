import PropTypes from 'prop-types';
import React, { Component } from 'react';

import api from '../api';
import { mapImage } from '../util';

class Replay extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      events: null,
    };
  }

  onComponentWillMount() {
    // Load events from the API
    api.get(`/api/telemetry/${this.props.match.id}?types=GameStatePeriodic`)
      .then(response => this.setState({ events: response.data }))
      .catch(console.error);
  }

  render() {
    const { consts, match } = this.props;
    return (
      <svg width="800" height="800">
        <image href={mapImage(consts.maps[match.map_name])} width="100%" height="100%" />
      </svg>
    );
  }
}

Replay.propTypes = {
  consts: PropTypes.objectOf(PropTypes.object).isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Replay;
