import PropTypes from 'prop-types';
import React from 'react';

import Circle from './Circle';

const Ray = ({
  start,
  end,
  color,
  size,
  ...rest
}) => (
  <g>
    <defs>
      <marker
        id="arrow"
        orient="auto"
        markerWidth={100}
        markerHeight={100}
        refX={0}
        refY={3}
        markerUnits="strokeWidth"
      >
        <path d="M0,0 V6 L5,3 Z" fill={color} />
      </marker>
    </defs>

    <Circle pos={start} r={size * 2} fill={color} />
    <line
      markerEnd="url(#arrow)"
      x1={start.x}
      y1={start.y}
      x2={end.x}
      y2={end.y}
      stroke={color}
      strokeWidth={size}
      {...rest}
    />
  </g>
);

Ray.propTypes = {
  start: PropTypes.objectOf(PropTypes.number).isRequired,
  end: PropTypes.objectOf(PropTypes.number).isRequired,
  color: PropTypes.string,
  size: PropTypes.number,
};

Ray.defaultProps = {
  color: 'white',
  size: 10,
};

export default Ray;
