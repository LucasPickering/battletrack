import PropTypes from 'prop-types';
import React from 'react';

import Circle from './Circle';

const Zone = ({ circle: { pos, radius }, ...rest }) => <Circle pos={pos} r={radius} {...rest} />;

Zone.propTypes = {
  circle: PropTypes.objectOf(PropTypes.any).isRequired,
  fill: PropTypes.string,
  strokeWidth: PropTypes.number,
};

Zone.defaultProps = {
  fill: 'none',
  strokeWidth: 10,
};

export default Zone;
