import PropTypes from 'prop-types';
import React, { Component } from 'react';

import BtPropTypes from '../util/BtPropTypes';
import RosterPalette from '../util/RosterPalette';

class EventMarks extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      mouseOver: null, // Null or mark ID
    };
  }

  render() {
    const { marks, scale, rosterPalette } = this.props;

    return marks.map(({
      id,
      icon: { code: iconCode, ...iconProps },
      pos: { x, y },
      player,
    }) => (
      <g
        key={id}
        fill={player ? rosterPalette.getPlayerColor(player.id) : undefined}
        transform={`translate(${x},${y}),scale(${scale})`}
        onMouseEnter={() => this.setState({ mouseOver: id })}
        onMouseLeave={() => this.setState({ mouseOver: null })}
      >
        <text className="fa" {...iconProps}>{iconCode}</text>
      </g>
    ));
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
};

export default EventMarks;
