import PropTypes from 'prop-types';
import React from 'react';

import BtPropTypes from '../util/BtPropTypes';

const Tooltip = props => {
  const {
    pos: { x, y },
    margin: { x: marginX, y: marginY },
    width,
    height,
    children,
  } = props;

  return (
    <g transform={`translate(${x + marginX},${(y - height) + marginY})`}>
      <rect width={width} height={height} fill="white" rx={20} ry={20} />
      {children}
    </g>
  );
};

Tooltip.propTypes = {
  pos: BtPropTypes.pos.isRequired,
  margin: BtPropTypes.pos,
  width: PropTypes.number,
  height: PropTypes.number,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
};

Tooltip.defaultProps = {
  margin: { x: 0, y: -60 },
  width: 600,
  height: 400,
  children: [],
};

export default Tooltip;
