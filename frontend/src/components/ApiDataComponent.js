import React from 'react';
import PropTypes from 'prop-types';
import { ClipLoader } from 'react-spinners';

import BtPropTypes from 'util/BtPropTypes';
import { isObjectEmpty, objectFilter, objectMap } from 'util/funcs';

import ApiError from './ApiError';
import 'styles/ApiDataComponent.css';

const ApiDataComponent = ({
  component,
  states,
  loadingText,
  ...rest
}) => {
  // If any states are loading, display loading
  if (Object.values(states).some(s => s.loading)) {
    return (
      <div className="loading">
        <ClipLoader color="var(--highlight-color-2)" loading {...rest} />
        {loadingText && <p className="loading-text">{loadingText}</p>}
      </div>
    );
  }

  // Pull out all states with errors
  const errors = objectMap(
    objectFilter(states, (key, val) => val.error),
    (key, val) => val.error,
  );
  // If there are any errors, render them
  if (!isObjectEmpty(errors)) {
    return objectMap(errors, (key, error) => <ApiError key={key} error={error} />);
  }

  // If we have all data objects, render the component
  const data = objectMap(states, (key, val) => val.data);
  if (Object.values(data).every(d => d)) {
    return React.createElement(component, data);
  }

  // Should only get here on first render
  return null;
};

ApiDataComponent.propTypes = {
  component: PropTypes.func.isRequired, // React component
  states: PropTypes.objectOf(BtPropTypes.apiState.isRequired).isRequired,
  loadingText: PropTypes.string,
  size: PropTypes.number,
};

ApiDataComponent.defaultProps = {
  loadingText: null,
  size: 100,
};

export default ApiDataComponent;
