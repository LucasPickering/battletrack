import React from 'react';
import PropTypes from 'prop-types';
import { Circle, Polygon, Polyline } from 'react-leaflet';

import BtPropTypes from 'util/BtPropTypes';
import { toLeaflet } from 'util/funcs';

const ArrowEnds = ({
  start,
  end,
  arrowSize,
  arrowAngle,
  ...rest
}) => {
  const p = toLeaflet(end);

  // I did lots of geometry for this, seems to work
  const w = arrowAngle * (Math.PI / 180);
  const theta = Math.PI + Math.atan2(end.y - start.y, end.x - start.x);
  const alpha = theta + w;
  const beta = theta - w;

  const dx1 = arrowSize * Math.cos(alpha);
  const dy1 = arrowSize * Math.sin(alpha);
  const dx2 = arrowSize * Math.cos(beta);
  const dy2 = arrowSize * Math.sin(beta);

  return (
    <div>
      <Circle radius={10} fillOpacity={1} center={toLeaflet(start)} {...rest} />
      <Polygon
        color="white"
        fillOpacity={1}
        positions={[
          p,
          [end.x + dx1, end.y + dy1],
          [end.x + dx2, end.y + dy2],
        ]}
        {...rest}
      />
    </div>
  );
};

ArrowEnds.propTypes = {
  start: BtPropTypes.pos.isRequired,
  end: BtPropTypes.pos.isRequired,
  arrowSize: PropTypes.number,
  arrowAngle: PropTypes.number,
};

ArrowEnds.defaultProps = {
  arrowSize: 40,
  arrowAngle: 20,
};

const Ray = ({
  start,
  end,
  showTailTip,
  color,
  ...rest
}) => (
  <div>
    <Polyline
      positions={[toLeaflet(start), toLeaflet(end)]}
      color={color}
      {...rest}
    />
    {showTailTip && <ArrowEnds start={start} end={end} color={color} />}
  </div>
);

Ray.propTypes = {
  start: BtPropTypes.pos.isRequired,
  end: BtPropTypes.pos.isRequired,
  color: PropTypes.string,
  showTailTip: PropTypes.bool,
};

Ray.defaultProps = {
  color: 'white',
  showTailTip: false,
};

export default Ray;
