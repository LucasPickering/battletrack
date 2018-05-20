import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Circle from './Circle';
import Ray from './Ray';

const MouseStates = Object.freeze({
  Kill: 'kill',
  Death: 'death',
});

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
    const { event: { attacker, player }, filters } = this.props;
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
            r={30}
            fill="red"
            onMouseEnter={killSetter}
            onMouseLeave={nullSetter}
          />
        )}
        {renderDeath && (
          <Circle
            pos={player.pos}
            r={30}
            fill="black"
            onMouseEnter={deathSetter}
            onMouseLeave={nullSetter}
          />
        )}
      </g>
    );
  }
}

KillEvent.propTypes = {
  event: PropTypes.objectOf(PropTypes.any).isRequired,
  filters: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default KillEvent;
