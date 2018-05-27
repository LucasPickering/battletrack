import PropTypes from 'prop-types';
import React, { Component } from 'react';

import BtPropTypes from '../util/BtPropTypes';
import RosterPalette from '../util/RosterPalette';

class EventMarks extends Component {
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
      return (
        <g
          key={id}
          fill={player ? rosterPalette.getPlayerColor(player.id) : undefined}
          transform={`translate(${x},${y}),scale(${scale})`}
          onMouseEnter={() => onMarkSelect(mark)}
          onMouseLeave={() => onMarkSelect(null)}
        >
          <text className="fa" {...iconProps}>{iconCode}</text>
        </g>
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
