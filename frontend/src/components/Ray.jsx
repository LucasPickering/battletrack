import PropTypes from 'prop-types';
import React from 'react';
import { Polyline } from 'react-leaflet';

import BtPropTypes from '../util/BtPropTypes';

const Ray = ({
  start,
  end,
  showTailTip,
  ...rest
}) => (
  <Polyline
    positions={[[start.x, start.y], [end.x, end.y]]}
    {...rest}
  />
);

Ray.propTypes = {
  start: BtPropTypes.pos.isRequired,
  end: BtPropTypes.pos.isRequired,
  showTailTip: PropTypes.bool,
};

Ray.defaultProps = {
  showTailTip: false,
};

export default Ray;
