import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { formatItem } from '../util';
import EventTooltip from './EventTooltip';

const SCALE = 40;
const STRAP_OFFSET = 0.3;

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
        <g
          transform={`translate(${pos.x},${pos.y}) scale(${SCALE})`}
          onMouseEnter={() => this.setState({ mouseOver: true })}
          onMouseLeave={() => this.setState({ mouseOver: false })}
        >
          <rect width={1} height={1} fill="#90210e" />
          <rect width={1} height={0.3} fill="#135b8d" />
          <path d={`M${STRAP_OFFSET},0 V1 Z`} stroke="#221a2f" strokeWidth={1 / 20} />
          <path d={`M${1 - STRAP_OFFSET},0 V1 Z`} stroke="#221a2f" strokeWidth={1 / 20} />
        </g>
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
