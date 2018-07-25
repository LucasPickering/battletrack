import React from 'react';

import BtPropTypes from 'util/BtPropTypes';

import 'styles/ApiError.css';

const ApiError = ({ error }) => <p className="api-error">{error.message}</p>;

ApiError.propTypes = {
  error: BtPropTypes.error.isRequired,
};

export default ApiError;
