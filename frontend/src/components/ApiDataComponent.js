import React from 'react';
import { identity } from 'lodash';
import PropTypes from 'prop-types';

import ApiPropTypes from 'proptypes/ApiPropTypes';

import ApiError from './ApiError';
import Loading from './Loading';

const ApiDataComponent = ({
  component,
  state,
  loadingText,
  isLoading,
  ...componentProps
}) => {
  // If loading, display a loading status
  if (isLoading(state.loading)) {
    return <Loading text={loadingText} />;
  }

  // If is an error, render it
  if (state.error) {
    return <ApiError error={state.error} />;
  }

  // If we have data, render the component
  if (state.data) {
    return React.createElement(component, componentProps);
  }

  // No data, no error, no loading - should only get here on first render
  return null;
};

ApiDataComponent.propTypes = {
  component: PropTypes.func.isRequired, // React component
  state: ApiPropTypes.apiState.isRequired,
  loadingText: PropTypes.string,
  isLoading: PropTypes.func,
};

ApiDataComponent.defaultProps = {
  loadingText: null,
  isLoading: identity,
};

export default ApiDataComponent;
