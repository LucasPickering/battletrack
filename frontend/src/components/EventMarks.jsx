import PropTypes from 'prop-types';
import React from 'react';

import BtPropTypes from '../util/BtPropTypes';
import RosterPalette from '../util/RosterPalette';

class EventMarks extends React.PureComponent {
  render() {
    const {
      marks,
      scale,
      rosterPalette,
      onMarkSelect,
    } = this.props;

    return marks.map(mark => {
      const {
        id,
        icon: { code: iconCode, ...iconProps },
        pos: { x, y },
        player,
      } = mark;

      // Select colors by player ID, if possible
      const colors = player ? {
        fill: rosterPalette.getRosterColorForPlayer(player.id),
        stroke: rosterPalette.getPlayerColor(player.id),
      } : {};

      return (
        <text
          key={id}
          className="fa"
          transform={`translate(${x},${y}),scale(${scale})`}
          textAnchor="middle"
          dominantBaseline="central"
          cursor="default"
          onMouseEnter={() => onMarkSelect(mark)}
          onMouseLeave={() => onMarkSelect(null)}
          strokeWidth={0.75}
          {...colors}
          {...iconProps}
        >
          {iconCode}
        </text>
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
  scale: PropTypes.number.isRequired,
  rosterPalette: PropTypes.instanceOf(RosterPalette).isRequired,
  onMarkSelect: PropTypes.func,
};

EventMarks.defaultProps = {
  onMarkSelect: () => {},
};

export default EventMarks;
