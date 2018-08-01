import React from 'react';
import PropTypes from 'prop-types';

import BtPropTypes from 'util/BtPropTypes';

import LeafletComponent from './LeafletComponent';
import Zones from './Zones';

class WhiteZones extends LeafletComponent {
  render() {
    const { data, ...rest } = this.props;
    return <Zones circles={data} color="white" fill={false} weight={1.5} {...rest} />;
  }
}

WhiteZones.propTypes = {
  data: PropTypes.arrayOf(BtPropTypes.circle.isRequired).isRequired,
};

export default WhiteZones;
