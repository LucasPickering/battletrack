import React from 'react';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

const ALL_KEY = '_all_';

const AllButtonGroup = ({
  values,
  selected,
  onChange,
  ...rest
}) => (
  <ToggleButtonGroup
    type="radio"
    value={selected || ALL_KEY}
    onChange={key => onChange(key === ALL_KEY ? null : key)}
    {...rest}
  >
    <ToggleButton value={ALL_KEY} bsSize="small">
      All
    </ToggleButton>
    {values.map(({ key, label }) => (
      <ToggleButton key={key} value={key} bsSize="small">
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
  name: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.shape({
    key: keyType.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired),
  selected: keyType,
  onChange: PropTypes.func,
};

AllButtonGroup.defaultProps = {
  values: [],
  selected: ALL_KEY,
  onChange: noop,
};

export default AllButtonGroup;
