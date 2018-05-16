import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { BarLoader } from 'react-spinners';

import api from '../api';

class ApiComponent extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
      data: null,
      error: null,
    };
  }

  componentDidMount() {
    this.loadData(this.props.url);
  }

  componentWillReceiveProps(nextProps) {
    const { url } = nextProps;

    // If the URL changed, load new data
    if (this.props.url !== url) {
      this.loadData(url);
    }
  }

  loadData(url) {
    this.setState({ loading: true, data: null, error: null }); // Reset state
    api.get(url)
      .then(response => {
        this.setState({ loading: false, data: response.data });
      })
      .catch(err => {
        this.setState({ loading: false, error: err });
      });
  }

  render() {
    const { loader, render } = this.props;
    const { loading, data, error } = this.state;

    if (loading) {
      return React.createElement(loader, { loading });
    }

    if (data) {
      // Loading finished and we have data so we can render
      return render(data);
    }

    if (error) {
      // An error occurred, render it (TODO)
      console.error(error);
      return null;
    }

    // Nothing yet, this is probably the first render
    return null;
  }
}

ApiComponent.propTypes = {
  url: PropTypes.string.isRequired,
  loader: PropTypes.func, // Should be a Loader class
  render: PropTypes.func,
};

ApiComponent.defaultProps = {
  loader: BarLoader,
  render: (() => null),
};

export default ApiComponent;
