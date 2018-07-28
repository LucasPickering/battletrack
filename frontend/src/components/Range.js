import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import 'styles/Range.css';

const TooltipRange = Slider.createSliderWithTooltip(Slider.Range); // Janky AF

const Range = ({ className, ...rest }) => (
  <TooltipRange
    className={classnames('bt-range', className)}
    {...rest}
  />
);

Range.propTypes = {
  className: PropTypes.string,
  count: PropTypes.number,
};

Range.defaultProps = {
  className: null,
  count: 1,
};

export default Range;
