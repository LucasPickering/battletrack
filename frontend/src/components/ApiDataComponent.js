import React from 'react';
import PropTypes from 'prop-types';

import BtPropTypes from 'util/BtPropTypes';

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
  state: BtPropTypes.apiState.isRequired,
  loadingText: PropTypes.string,
  isLoading: PropTypes.func,
};

ApiDataComponent.defaultProps = {
  loadingText: 'Loading...',
  isLoading: stateLoading => stateLoading,
};

export default ApiDataComponent;