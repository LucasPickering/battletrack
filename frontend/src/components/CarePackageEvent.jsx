import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { formatItem } from '../util';
import Circle from './Circle';
import EventTooltip from './EventTooltip';

class CarePackageEvent extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      mouseOver: false,
    };
  }

  render() {
    const { event: { pos, items, time } } = this.props;
    const { mouseOver } = this.state;

    return (
      <g>
        <Circle
          pos={pos}
          r={30}
          fill="green"
          onMouseEnter={() => this.setState({ mouseOver: true })}
          onMouseLeave={() => this.setState({ mouseOver: false })}
        />
        {mouseOver && (
          <EventTooltip pos={pos} eventType="Care Package" time={time}>
            {items.map(formatItem)}
          </EventTooltip>
        )}
      </g>
    );
  }
}

CarePackageEvent.propTypes = {
  event: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default CarePackageEvent;
