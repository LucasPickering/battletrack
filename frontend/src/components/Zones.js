import PropTypes from 'prop-types';
import React from 'react';
import { Circle } from 'react-leaflet';
import uniqid from 'uniqid';

import BtPropTypes from '../util/BtPropTypes';

const Zones = ({ circles, ...rest }) => circles.map(({
  pos: { x, y },
  radius,
}) => <Circle key={uniqid()} center={[x, y]} radius={radius} {...rest} />);

Zones.propTypes = {
  circles: PropTypes.arrayOf(BtPropTypes.circle).isRequired,
};

export default Zones;
