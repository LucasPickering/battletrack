import PropTypes from 'prop-types';
import React from 'react';

import BtPropTypes from '../BtPropTypes';

const Circle = ({ pos: { x, y }, radius, ...rest }) =>
  <circle cx={x} cy={y} r={radius} {...rest} />;

Circle.propTypes = {
  pos: BtPropTypes.pos.isRequired,
  radius: PropTypes.number,
};

Circle.defaultProps = {
  radius: 5,
};

export default Circle;
