import PropTypes from 'prop-types';
import React from 'react';

const Circle = ({ pos: { x, y }, ...rest }) => <circle cx={x} cy={y} {...rest} />;

Circle.propTypes = {
  pos: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  r: PropTypes.number,
};

Circle.defaultProps = {
  r: 5,
};

export default Circle;
