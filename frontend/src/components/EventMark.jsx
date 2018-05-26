import PropTypes from 'prop-types';
import React, { Component } from 'react';

import BtPropTypes from '../util/BtPropTypes';
import EventTooltip from './EventTooltip';

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
        {icon}
      </g>
    );
  }
}

EventMark.propTypes = {
  icon: PropTypes.element.isRequired,
  color: PropTypes.string,
  pos: BtPropTypes.pos.isRequired,
  time: PropTypes.number.isRequired,
  player: PropTypes.objectOf(PropTypes.any),
};

EventMark.defaultProps = {
  color: 'white',
  player: null,
};

export default EventMark;
