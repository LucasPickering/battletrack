import React from 'react';
import { isEqual } from 'lodash';

class LeafletComponent extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps); // TODO Shallow comparison?
  }
}

export default LeafletComponent;
