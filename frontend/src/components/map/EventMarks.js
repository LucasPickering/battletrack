import Leaflet from 'leaflet';
import PropTypes from 'prop-types';
import React from 'react';
import { Marker } from 'react-leaflet';
import toCss from 'to-css';

import BtPropTypes from 'util/BtPropTypes';
import Localization from 'util/Localization';
import RosterPalette from 'util/RosterPalette';
import { toLeaflet } from 'util/funcs';
import MarkTooltip from './MarkTooltip';

class EventMarks extends React.PureComponent {
  render() {
    const {
      marks,
      rosterPalette,
      onMarkSelect,
    } = this.props;

    return marks.map(mark => {
      const {
        id,
        type,
        icon: { code: iconCode, ...iconStyle },
        time,
        tooltip,
        pos,
        player,
      } = mark;

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
        <Marker key={id} position={toLeaflet(pos)} icon={icon} onClick={onMarkSelect}>
          <MarkTooltip
            title={Localization.eventMarks[type].single}
            time={time}
            text={tooltip}
          />
        </Marker>
      );
    });
  }
}

EventMarks.propTypes = {
  marks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    icon: PropTypes.objectOf(PropTypes.any).isRequired,
    pos: BtPropTypes.pos.isRequired,
    time: PropTypes.number.isRequired,
    player: PropTypes.objectOf(PropTypes.any),
  })).isRequired,
  rosterPalette: PropTypes.instanceOf(RosterPalette).isRequired,
  onMarkSelect: PropTypes.func,
};

EventMarks.defaultProps = {
  onMarkSelect: () => {},
};

export default EventMarks;
