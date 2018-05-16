import PropTypes from 'prop-types';
import React from 'react';

const Circle = ({ pos: { x, y }, ...rest }) => <circle cx={x} cy={y} {...rest} />;

Circle.propTypes = {
  pos: PropTypes.objectOf(PropTypes.number).isRequired,
  r: PropTypes.number,
};

Circle.defaultProps = {
  r: 10,
};

export default Circle;
