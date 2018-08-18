import React from 'react';
import PropTypes from 'prop-types';

import ApiPropTypes from 'proptypes/ApiPropTypes';

import 'styles/ApiError.css';

const ErrorComponent = ({ error }) => <p className="api-error">Error: {error.data.detail}</p>;

ErrorComponent.propTypes = {
  error: ApiPropTypes.error.isRequired,
};

const ApiError = ({ error, errors }) => {
  if (error) {
    return <ErrorComponent error={error} />;
  }
  if (errors) {
    return Object.entries(errors).map(([key, e]) => <ErrorComponent key={key} error={e} />);
  }
  return null;
};

ApiError.propTypes = {
  error: ApiPropTypes.error,
  errors: PropTypes.objectOf(ApiPropTypes.error.isRequired),
};

ApiError.defaultProps = {
  error: null,
  errors: null,
};

export default ApiError;
