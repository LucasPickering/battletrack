import PropTypes from 'prop-types';
import React from 'react';
import uniqid from 'uniqid';

import BtPropTypes from '../util/BtPropTypes';

const Zones = ({ circles, ...rest }) => circles.map(({
  pos: { x, y },
  radius,
}) => <circle key={uniqid()} cx={x} cy={y} r={radius} {...rest} />);

Zones.propTypes = {
  circles: PropTypes.arrayOf(BtPropTypes.circle).isRequired,
  fill: PropTypes.string,
  strokeWidth: PropTypes.number,
};

Zones.defaultProps = {
  fill: 'none',
  strokeWidth: 10,
};

export default Zones;
