import PropTypes from 'prop-types';
import React from 'react';
import { BarLoader } from 'react-spinners';

import api from '../util/api';

class ApiComponent extends React.PureComponent {
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

  componentDidUpdate(prevProps) {
    const { url: oldUrl } = prevProps;
    const { url: newUrl } = this.props;

    // If the URL changed, load new data
    if (oldUrl !== newUrl) {
      this.loadData(newUrl);
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
    const {
      loader,
      component,
      dataProp,
      ...rest
    } = this.props;
    const { loading, data, error } = this.state;

    if (loading) {
      return React.createElement(loader, { loading });
    }

    if (data) {
      // Loading finished and we have data so we can render the element
      return React.createElement(component, { [dataProp]: data, ...rest });
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
  component: PropTypes.func.isRequired,
  dataProp: PropTypes.string,
  loader: PropTypes.func, // Should be a Loader class
};

ApiComponent.defaultProps = {
  loader: BarLoader,
  dataProp: 'data',
};

export default ApiComponent;
