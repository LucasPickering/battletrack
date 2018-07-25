import React from 'react';
import PropTypes from 'prop-types';
import { ClipLoader } from 'react-spinners';

import BtPropTypes from 'util/BtPropTypes';

import ApiError from './ApiError';
import 'styles/ApiStatusComponent.css';

const ApiStatusComponent = ({
  component,
  status: {
    loading,
    data,
    error,
  },
  loadingText,
  ...rest
}) => {
  if (loading) {
    return (
      <div className="loading">
        <ClipLoader color="var(--highlight-color-2)" loading={loading} {...rest} />
        {loadingText && <p className="loading-text">{loadingText}</p>}
      </div>
    );
  }
  if (data) {
    return React.createElement(component, { data });
  }
  if (error) {
    return <ApiError error={error} />;
  }
  return null;
};

ApiStatusComponent.propTypes = {
  component: PropTypes.func.isRequired, // React component
  status: BtPropTypes.apiStatus.isRequired,
  loadingText: PropTypes.string,
  size: PropTypes.number,
};

ApiStatusComponent.defaultProps = {
  loadingText: null,
  size: 100,
};

export default ApiStatusComponent;
