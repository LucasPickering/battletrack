import PropTypes from 'prop-types';
import React from 'react';

const Icon = ({ code, ...rest }) => (
  <p className="fa" {...rest}>
    {String.fromCharCode(code)}
  </p>
);

Icon.propTypes = {
  code: PropTypes.number.isRequired,
};

export default Icon;
