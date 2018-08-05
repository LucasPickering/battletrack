import React from 'react';
import Leaflet from 'leaflet';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import { Marker } from 'react-leaflet';
import reactToCss from 'react-style-object-to-css';

import BtPropTypes from 'util/BtPropTypes';
import Localization from 'util/Localization';
import { toLeaflet } from 'util/funcs';

import { buildIconProps } from 'components/Icon';
import LeafletComponent from 'components/map/LeafletComponent';
import 'styles/map/EventMark.css';

import MarkTooltip from './MarkTooltip';

class EventMark extends LeafletComponent {
  render() {
    const {
      type,
      icon,
      time,
      tooltip,
      pos,
      player,
      rosterPalette,
      onMarkSelect,
      ...rest
    } = this.props;

    // Used the icon passed in and the player's info to build props for an icon for this event
    const {
      className: iconClass,
      style: iconStyle,
    } = buildIconProps({
      ...icon,
      color: player ? rosterPalette.getRosterColorForPlayer(player.id) : 'white',
    });
    // Build an HTML element from the props
    const iconElement = Leaflet.divIcon({
      html: `<p class="${iconClass}" style="${reactToCss(iconStyle)}" />`,
    });

    return (
      <Marker
        position={toLeaflet(pos)}
        icon={iconElement}
        onClick={onMarkSelect}
        {...rest}
      >
        <MarkTooltip
          title={Localization.eventMarks[type].single}
          time={time}
        >
          {tooltip}
        </MarkTooltip>
      </Marker>
    );
  }
}

EventMark.propTypes = {
  type: PropTypes.string.isRequired,
  icon: PropTypes.objectOf(PropTypes.any).isRequired,
  pos: BtPropTypes.pos.isRequired,
  time: PropTypes.number.isRequired,
  tooltip: BtPropTypes.tooltipContent,
  player: PropTypes.shape({ id: PropTypes.string.isRequired }),
  rosterPalette: BtPropTypes.rosterPalette.isRequired,
  onMarkSelect: PropTypes.func,
};

EventMark.defaultProps = {
  player: null,
  tooltip: null,
  onMarkSelect: noop,
};

export default EventMark;
