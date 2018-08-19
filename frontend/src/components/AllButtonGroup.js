import classNames from 'classnames';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import CommonPropTypes from 'proptypes/CommonPropTypes';

const ALL_KEY = '_all_';

const AllButtonGroup = ({
  className,
  values,
  selected,
  size,
  placement,
  onChange,
  ...rest
}) => (
  <ToggleButtonGroup
    className={classNames(className, placement === 'right' ? 'grid-right' : null)}
    value={selected || ALL_KEY}
    onChange={key => onChange(key === ALL_KEY ? null : key)}
    {...rest}
  >
    <ToggleButton
      value={ALL_KEY}
      bsSize={size}
    >
      All
    </ToggleButton>
    {values.map(({ key, label }) => (
      <ToggleButton
        key={key}
        value={key}
        bsSize={size}
      >
        {label}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);

const keyType = PropTypes.oneOfType([
  PropTypes.string.isRequired,
  PropTypes.number.isRequired,
]);

AllButtonGroup.propTypes = {
  className: PropTypes.string,

  type: PropTypes.oneOf(['checkbox', 'radio']).isRequired,
  name: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.shape({
    key: keyType.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired),
  selected: keyType,

  size: CommonPropTypes.size,
  placement: CommonPropTypes.placement,

  onChange: PropTypes.func,
};

AllButtonGroup.defaultProps = {
  className: null,
  values: [],
  selected: ALL_KEY,
  size: 'small',
  placement: 'left',
  onChange: noop,
};

export default AllButtonGroup;
