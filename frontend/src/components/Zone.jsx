import PropTypes from 'prop-types';
import React from 'react';

import BtPropTypes from '../BtPropTypes';
import Circle from './Circle';

const Zone = ({ circle, ...rest }) => <Circle {...circle} {...rest} />;

Zone.propTypes = {
  circle: BtPropTypes.circle.isRequired,
  fill: PropTypes.string,
  strokeWidth: PropTypes.number,
};

Zone.defaultProps = {
  fill: 'none',
  strokeWidth: 10,
};

export default Zone;
