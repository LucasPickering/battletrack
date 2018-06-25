import PropTypes from 'prop-types';
import React from 'react';
import { Circle, Polyline } from 'react-leaflet';

import BtPropTypes from '../util/BtPropTypes';
import { toLeaflet } from '../util/funcs';

const Ray = ({
  start,
  end,
  showTailTip,
  ...rest
}) => (
  <div>
    <Polyline
      positions={[toLeaflet(start), toLeaflet(end)]}
      {...rest}
    />
    {showTailTip &&
      <Circle color="white" radius={10} center={toLeaflet(start)} />
    }
  </div>
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
