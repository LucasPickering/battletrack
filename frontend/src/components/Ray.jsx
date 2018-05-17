import PropTypes from 'prop-types';
import React from 'react';

const Ray = ({ start, end, ...rest }) => (
  <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} {...rest} />
);

Ray.propTypes = {
  start: PropTypes.objectOf(PropTypes.number).isRequired,
  end: PropTypes.objectOf(PropTypes.number).isRequired,
};

export default Ray;
