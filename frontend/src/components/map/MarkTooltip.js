import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'react-leaflet';
import uniqid from 'uniqid';

import CommonPropTypes from 'proptypes/CommonPropTypes';
import { formatSeconds } from 'util/formatters';

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
    <Popup className="bt-tooltip">
      <h4 className="title">{title}</h4>
      {content.map(({ icon, text }) => (
        <div className="tooltip-line" key={uniqid()}>
          {icon && <Icon {...icon} />}
          <p>{text}</p>
        </div>
      ))}
    </Popup>
  );
};

MarkTooltip.propTypes = {
  title: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  children: CommonPropTypes.tooltipContent,
};

MarkTooltip.defaultProps = {
  children: [],
};

export default MarkTooltip;
