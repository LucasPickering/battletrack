import Leaflet from 'leaflet';
import PropTypes from 'prop-types';
import React from 'react';
import { Marker } from 'react-leaflet';
import toCss from 'to-css';

import BtPropTypes from 'util/BtPropTypes';
import Localization from 'util/Localization';
import { toLeaflet } from 'util/funcs';
import MarkTooltip from './MarkTooltip';

const EventMark = ({
  type,
  icon: { code: iconCode, ...iconStyle },
  time,
  tooltip,
  pos,
  player,
  rosterPalette,
  onMarkSelect,
  ...rest
}) => {
  const fullIconStyle = {
    // Set colors by player ID, if possible
    color: player ? rosterPalette.getRosterColorForPlayer(player.id) : 'white',
    ...iconStyle,
  };

  const icon = Leaflet.divIcon({
    className: 'fa',
    style: { color: 'red' },
    html: `<p style="${toCss(fullIconStyle)}">${iconCode}</p>`,
  });
  return (
    <Marker position={toLeaflet(pos)} icon={icon} onClick={onMarkSelect} {...rest}>
      <MarkTooltip
        title={Localization.eventMarks[type].single}
        time={time}
        text={tooltip}
      />
    </Marker>
  );
};

EventMark.propTypes = {
  type: PropTypes.string.isRequired,
  icon: PropTypes.objectOf(PropTypes.any).isRequired,
  pos: BtPropTypes.pos.isRequired,
  time: PropTypes.number.isRequired,
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
  player: PropTypes.shape({ id: PropTypes.string.isRequired }),
  rosterPalette: BtPropTypes.rosterPalette.isRequired,
  onMarkSelect: PropTypes.func,
};

EventMark.defaultProps = {
  player: null,
  onMarkSelect: () => {},
};

export default EventMark;
