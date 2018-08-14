import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

/*
 * ANTI-PATTERN WARNING
 * This is funky because Icon is _usually_ used as a regular component, but when rendered on the
 * map, it needs to be embedded directly as HTML. There's an inner function that builds the props
 * to be passed to an element in order to render that icon. That function is used in the component,
 * but it's also exported so the map can use it directly.
 */

// Format to font-weight mapping
const FORMATS = {
  regular: 400,
  solid: 900,
};

// This is declared here because it's needed by buildIconProps, which is needed in Icon
const defaultProps = {
  className: null,
  format: 'solid',
  color: null,
};

/**
 * Builds props for an icon element.
 *
 * @param      {object}  iconProps  The icon properties
 * @return     {object}  The icon.
 */
export function buildIconProps(iconProps) {
  // Merge the props passed in with the defaults to get a full props object
  const fullProps = {
    ...defaultProps,
    ...iconProps,
  };

  // Pull out the props fields we want
  const {
    className,
    name,
    format,
    color,
    ...rest
  } = fullProps;

  // Build props meant to be passed to an <i> tag
  return {
    className: classnames(
      className,
      'bt-icon',
      'fa',
      `fa-${name}`,
    ),
    style: {
      fontWeight: FORMATS[format],
      color,
    },
    ...rest,
  };
}

const Icon = props => <i {...buildIconProps(props)} />;

Icon.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  format: PropTypes.oneOf(Object.keys(FORMATS)),
  color: PropTypes.string,
};

Icon.defaultProps = defaultProps;

export default Icon;
