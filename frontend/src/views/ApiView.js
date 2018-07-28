import React from 'react';

class ApiComponent extends React.PureComponent {
  componentDidMount() {
    this.updateData();
  }

  componentDidUpdate() {
    this.updateData();
  }
}

export default ApiComponent;
