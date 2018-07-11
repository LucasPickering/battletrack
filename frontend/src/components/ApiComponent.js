import axios from 'axios';
import PropTypes from 'prop-types';
import React from 'react';
import { ClipLoader } from 'react-spinners';

import 'styles/ApiComponent.css';

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
    const { url } = this.props;
    this.loadData(url);
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
    axios.get(url)
      .then(response => {
        this.setState({ loading: false, data: response.data });
      })
      .catch(err => {
        this.setState({ loading: false, error: err });
      });
  }

  render() {
    const {
      component,
      dataProp,
      loader,
      loaderText,
      loaderProps,
      ...rest
    } = this.props;
    const { loading, data, error } = this.state;

    if (loader && loading) {
      return (
        <div className="loader">
          {React.createElement(loader, {
            color: 'var(--highlight-color-2)',
            loading,
            ...loaderProps,
          })}
          <p className="loader-text">{loaderText}</p>
        </div>
      );
    }

    if (data) {
      // Loading finished and we have data so we can render the element
      return React.createElement(component, { [dataProp]: data, ...rest });
    }

    if (error) {
      // An error occurred, render it
      return <p className="api-error">{error.message}</p>;
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
  loaderText: PropTypes.string,
  loaderProps: PropTypes.objectOf(PropTypes.any),
};

ApiComponent.defaultProps = {
  dataProp: 'data',
  loader: ClipLoader,
  loaderText: 'Loading...',
  loaderProps: { size: 100 },
};

export default ApiComponent;
