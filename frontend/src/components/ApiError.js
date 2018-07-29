import React from 'react';
import PropTypes from 'prop-types';

import BtPropTypes from 'util/BtPropTypes';

import 'styles/ApiError.css';

const ErrorComponent = ({ error }) => <p className="api-error">{error.data.detail}</p>;

ErrorComponent.propTypes = {
  error: BtPropTypes.error.isRequired,
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
  error: BtPropTypes.error,
  errors: PropTypes.objectOf(BtPropTypes.error.isRequired),
};

ApiError.defaultProps = {
  error: null,
  errors: null,
};

export default ApiError;
