import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const Icon = ({
  className,
  name,
  color,
  ...rest
}) => (
  <i
    className={classnames(className, 'fa', `fa-${name}`)}
    style={{ color }}
    {...rest}
  />
);

Icon.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
};

Icon.defaultProps = {
  className: null,
  color: 'inherit',
};

export default Icon;
