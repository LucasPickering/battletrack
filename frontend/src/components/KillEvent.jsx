import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Circle from './Circle';
import Ray from './Ray';
import EventTooltip from './EventTooltip';

const DOT_SIZE = 10;

const MouseStates = Object.freeze({
  Kill: 'kill',
  Death: 'death',
});

function tooltip(mouseState, event) {
  const { attacker, player, time } = event;

  let props;
  switch (mouseState) {
    case MouseStates.Kill:
      props = { pos: attacker.pos, eventType: 'Kill' };
      break;
    case MouseStates.Death:
      props = { pos: player.pos, eventType: 'Death' };
      break;
    default:
      return null;
  }

  return (
    <EventTooltip
      width={800}
      time={time}
      {...props}
    >
      {attacker && `Kill: ${attacker.name}`}
      {`Death: ${player.name}`}
    </EventTooltip>
  );
}

class KillEvent extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      mouseOver: null, // null or one of MouseStates
    };
  }

  mouseOverStateSetter(val) {
    return () => this.setState({ mouseOver: val });
  }

  render() {
    const { event, playerColors, filters } = this.props;
    const { attacker, player } = event;
    const { mouseOver } = this.state;

    // If the mouse is over either dot, render both
    const renderKill = attacker && (mouseOver || filters.includes('Kills'));
    const renderDeath = mouseOver || filters.includes('Deaths');

    // These will be used multiple times so save them
    const nullSetter = this.mouseOverStateSetter(null);
    const killSetter = this.mouseOverStateSetter(MouseStates.Kill);
    const deathSetter = this.mouseOverStateSetter(MouseStates.Death);

    return (
      <g>
        {mouseOver && attacker &&
          <Ray start={attacker.pos} end={player.pos} stroke="red" strokeWidth={5} />}
        {renderKill && (
          <Circle
            pos={attacker.pos}
            r={DOT_SIZE}
            fill={playerColors[attacker.id]}
            onMouseEnter={killSetter}
            onMouseLeave={nullSetter}
          />
        )}
        {renderDeath && (
          <Circle
            pos={player.pos}
            r={DOT_SIZE}
            fill={playerColors[player.id]}
            onMouseEnter={deathSetter}
            onMouseLeave={nullSetter}
          />
        )}
        {tooltip(mouseOver, event)}
      </g>
    );
  }
}

KillEvent.propTypes = {
  event: PropTypes.objectOf(PropTypes.any).isRequired,
  playerColors: PropTypes.objectOf(PropTypes.string).isRequired,
  filters: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default KillEvent;
