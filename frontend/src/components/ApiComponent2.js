import React from 'react';

class ApiComponent extends React.PureComponent {
  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate() {
    this.loadData();
  }
}

export default ApiComponent;
