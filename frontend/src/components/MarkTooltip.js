import PropTypes from 'prop-types';
import React from 'react';
import { Popup } from 'react-leaflet';
import uniqid from 'uniqid';

import { formatSeconds } from '../util/funcs';
import '../styles/MarkTooltip.css';

const MarkTooltip = props => {
  const {
    title,
    time,
    text,
  } = props;

  const lines = [`\uf017 ${formatSeconds(time)}`, ...text];

  return (
    <Popup className="bt-tooltip fa text">
      <div>
        <h4 className="title">{title}</h4>
        {lines.map(line => <p key={uniqid()}>{line}</p>)}
      </div>
    </Popup>
  );
};

MarkTooltip.propTypes = {
  title: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  text: PropTypes.arrayOf(PropTypes.string),
};

MarkTooltip.defaultProps = {
  text: [],
};

export default MarkTooltip;
