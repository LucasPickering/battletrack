import PropTypes from 'prop-types';
import React from 'react';
import uniqid from 'uniqid';

import { formatSeconds } from '../util';
import Tooltip from './Tooltip';

const EventTooltip = props => {
  const {
    pos,
    eventType,
    time,
    heights: {
      eventType: eventTypeHeight,
      time: timeHeight,
      gap: gapHeight,
      children: childrenHeight,
    },
    children,
    ...rest
  } = props;

  const lines = (Array.isArray(children) ? children : [children]).filter(e => e);
  const [firstLine, ...restLines] = lines;

  const rectHeight = eventTypeHeight + timeHeight + gapHeight
    + (childrenHeight * lines.length) + 30;

  return (
    <Tooltip pos={pos} height={rectHeight} {...rest}>
      <text fill="black">
        <tspan x={0} dy={eventTypeHeight} fontSize={eventTypeHeight}>{eventType}</tspan>
        <tspan x={0} dy={eventTypeHeight} fontSize={timeHeight}>{formatSeconds(time)}</tspan>
        <tspan x={0} dy={timeHeight + gapHeight} fontSize={childrenHeight}>{firstLine}</tspan>
        {restLines.map(line => (
          <tspan key={uniqid()} x={0} dy={childrenHeight} fontSize={childrenHeight}>{line}</tspan>
        ))}
      </text>
    </Tooltip>
  );
};

EventTooltip.propTypes = {
  pos: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }).isRequired,
  eventType: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  heights: PropTypes.shape({
    eventType: PropTypes.number,
    time: PropTypes.number,
    gap: PropTypes.number,
    children: PropTypes.number,
  }),
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
};

EventTooltip.defaultProps = {
  heights: {
    eventType: 80,
    time: 60,
    gap: 20,
    children: 60,
  },
  children: '',
};

export default EventTooltip;
