import React from 'react';

import BtPropTypes from 'util/BtPropTypes';

const ErrorMessage = ({ error }) => <p className="api-error">{error.message}</p>;

ErrorMessage.propTypes = {
  error: BtPropTypes.error.isRequired,
};

export default ErrorMessage;
