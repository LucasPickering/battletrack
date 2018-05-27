import PropTypes from 'prop-types';
import React from 'react';
import { Panel } from 'react-bootstrap';

import { formatSeconds } from '../util/funcs';
import '../styles/MarkTooltip.css';

const MarkTooltip = props => {
  const {
    title,
    time,
    children,
    ...rest
  } = props;

  return (
    <Panel className="fa bt-tooltip" {...rest}>
      <h4>{title}</h4>
      <h5>{formatSeconds(time)}</h5>
      {children}
    </Panel>
  );
};

MarkTooltip.propTypes = {
  title: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  children: PropTypes.any,
};

MarkTooltip.defaultProps = {
  children: null,
};

export default MarkTooltip;
