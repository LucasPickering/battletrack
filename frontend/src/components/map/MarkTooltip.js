import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'react-leaflet';
import uniqid from 'uniqid';

import BtPropTypes from 'util/BtPropTypes';
import { formatSeconds } from 'util/funcs';

import Icon from 'components/Icon';
import 'styles/map/MarkTooltip.css';

const MarkTooltip = props => {
  const {
    title,
    time,
    children,
  } = props;

  const content = [
    { icon: { name: 'clock' }, text: formatSeconds(time) }, // Add event time
    ...children,
  ];

  return (
    <Popup className="bt-tooltip fa text">
      <div>
        <h4 className="title">{title}</h4>
        {content.map(({ icon, text }) => (
          <div key={uniqid()}>
            {icon && <Icon {...icon} />}
            <p>{text}</p>
          </div>
        ))}
      </div>
    </Popup>
  );
};

MarkTooltip.propTypes = {
  title: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  children: BtPropTypes.tooltipContent,
};

MarkTooltip.defaultProps = {
  children: [],
};

export default MarkTooltip;
