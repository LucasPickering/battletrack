import PropTypes from 'prop-types';
import React from 'react';
import { Circle } from 'react-leaflet';
import uniqid from 'uniqid';

import MapPropTypes from 'proptypes/MapPropTypes';

const Zones = ({ circles, ...rest }) => circles.map(({
  pos: { x, y },
  radius,
}) => <Circle key={uniqid()} center={[x, y]} radius={radius} {...rest} />);

Zones.propTypes = {
  circles: PropTypes.arrayOf(MapPropTypes.circle).isRequired,
};

export default Zones;
