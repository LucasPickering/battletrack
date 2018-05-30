import PropTypes from 'prop-types';
import React from 'react';
import { Panel } from 'react-bootstrap';
import uniqid from 'uniqid';

import { formatSeconds } from '../util/funcs';
import '../styles/MarkTooltip.css';

const MarkTooltip = props => {
  const {
    title,
    time,
    text,
    children,
    ...rest
  } = props;

  const lines = [`\uf017 ${formatSeconds(time)}`, ...text];

  return (
    <Panel className="bt-tooltip" {...rest}>
      <div className="fa text">
        <h4 className="title">{title}</h4>
        {lines.map(line => <p key={uniqid()}>{line}</p>)}
      </div>
    </Panel>
  );
};

MarkTooltip.propTypes = {
  title: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  text: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
};

MarkTooltip.defaultProps = {
  text: [],
  children: null,
};

export default MarkTooltip;
