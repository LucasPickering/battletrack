import React from 'react';

import MapPropTypes from 'proptypes/MapPropTypes';

import LeafletComponent from './LeafletComponent';
import Ray from './Ray';

class Plane extends LeafletComponent {
  render() {
    const { data, ...rest } = this.props;
    return <Ray {...data} color="white" showTailTip weight={1.5} {...rest} />;
  }
}

Plane.propTypes = {
  data: MapPropTypes.ray.isRequired,
};

export default Plane;
