import PropTypes from 'prop-types';
import React from 'react';

import BtPropTypes from '../util/BtPropTypes';

const Ray = ({
  start,
  end,
  color,
  showTailTip,
  ...rest
}) => (
  <g>
    <defs>
      <marker
        id="arrow"
        orient="auto"
        markerWidth={10}
        markerHeight={10}
        refX={0}
        refY={3}
        markerUnits="strokeWidth"
      >
        <path d="M0,0 V6 L5,3 Z" fill={color} />
      </marker>
      <marker
        id="dot"
        markerWidth={4}
        markerHeight={4}
        refX={2}
        refY={2}
        markerUnits="strokeWidth"
      >
        <circle cx={2} cy={2} r={2} fill={color} />
      </marker>
    </defs>

    <line
      markerStart={showTailTip ? 'url(#dot)' : null}
      markerEnd={showTailTip ? 'url(#arrow)' : null}
      x1={start.x}
      y1={start.y}
      x2={end.x}
      y2={end.y}
      stroke={color}
      {...rest}
    />
  </g>
);

Ray.propTypes = {
  start: BtPropTypes.pos.isRequired,
  end: BtPropTypes.pos.isRequired,
  color: PropTypes.string,
  strokeWidth: PropTypes.number,
  showTailTip: PropTypes.bool,
};

Ray.defaultProps = {
  color: 'white',
  strokeWidth: 10,
  showTailTip: false,
};

export default Ray;
