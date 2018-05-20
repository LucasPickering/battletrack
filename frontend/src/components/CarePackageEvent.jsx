import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Circle from './Circle';

class CarePackageEvent extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      mouseOver: false,
    };
  }

  render() {
    const { event: { pos } } = this.props;
    const { mouseOver } = this.state;

    return (
      <Circle
        pos={pos}
        r={30}
        fill="green"
        onMouseEnter={() => this.setState({ mouseOver: false })}
        onMouseLeave={() => this.setState({ mouseOver: true })}
      />
    );
  }
}

CarePackageEvent.propTypes = {
  event: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default CarePackageEvent;
