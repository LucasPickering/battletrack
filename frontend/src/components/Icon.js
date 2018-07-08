import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const Icon = ({
  className,
  code,
  name,
  ...rest
}) => (
  <p
    className={classnames(className, 'fa', `fa-${name}`)}
    style={{ color: 'inherit' }}
    {...rest}
  >
    {code !== null && String.fromCharCode(code)}
  </p>
);

Icon.propTypes = {
  className: PropTypes.string,
  code: PropTypes.number,
  name: PropTypes.string,
};

Icon.defaultProps = {
  className: null,
  code: null,
  name: null,
};

export default Icon;
