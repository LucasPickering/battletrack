import PropTypes from 'prop-types';
import { Component } from 'react';

class ApiComponent extends Component {
  componentDidMount() {
    this.refresh(this.props.match.params); // First-time fetch
  }

  componentWillReceiveProps(nextProps) {
    // If the URL parameters changed, fetch refresh with the new params
    const oldParams = this.props.match.params;
    const newParams = nextProps.match.params;
    if (oldParams !== newParams) {
      this.refresh(newParams);
    }
  }
}

ApiComponent.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default ApiComponent;