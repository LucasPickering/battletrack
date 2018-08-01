import React from 'react';

import BtPropTypes from 'util/BtPropTypes';

import LeafletComponent from './LeafletComponent';
import Ray from './Ray';

class Plane extends LeafletComponent {
  render() {
    const { data, ...rest } = this.props;
    return <Ray {...data} color="white" showTailTip weight={1.5} {...rest} />;
  }
}

Plane.propTypes = {
  data: BtPropTypes.ray.isRequired,
};

export default Plane;
