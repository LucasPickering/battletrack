import React from 'react';
import { isEqual } from 'lodash';

class LeafletComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }
}

export default LeafletComponent;
