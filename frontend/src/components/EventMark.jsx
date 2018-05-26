import PropTypes from 'prop-types';
import React, { Component } from 'react';

import BtPropTypes from '../BtPropTypes';
import Circle from './Circle';
import EventTooltip from './EventTooltip';

const DOT_SIZE = 10;

class EventMark extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      mouseOver: false,
    };
  }

  render() {
    const {
      icon,
      color,
      pos,
      time,
      player,
    } = this.props;
    const { mouseOver } = this.state;

    return (
      <g
        fill={color}
        transform={`translate(${pos.x},${pos.y})`}
        onMouseEnter={() => this.setState({ mouseOver: true })}
        onMouseLeave={() => this.setState({ mouseOver: false })}
      >
        {icon || (
          <Circle
            pos={{ x: 0, y: 0 }}
            r={DOT_SIZE}
            fill={color || 'white'}
          />
        )}
      </g>
    );
  }
}

EventMark.propTypes = {
  icon: PropTypes.element,
  color: PropTypes.string,
  pos: BtPropTypes.pos.isRequired,
  time: PropTypes.number.isRequired,
  player: PropTypes.objectOf(PropTypes.any),
};

EventMark.defaultProps = {
  icon: null,
  color: null,
  player: null,
};

export default EventMark;
