import PropTypes from 'prop-types';

const exported = {};

exported.error = PropTypes.shape({
  // TODO
});

exported.apiState = PropTypes.shape({
  params: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  data: PropTypes.any,
  error: PropTypes.error,
});

export default exported;
