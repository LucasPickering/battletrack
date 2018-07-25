import PropTypes from 'prop-types';

const history = PropTypes.objectOf(PropTypes.any);

const children = PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]);

const error = PropTypes.shape({
  // TODO
});

// --- RAW DATA ---

const player = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
});

// --- API STUFF ---

const apiState = PropTypes.shape({
  params: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  data: PropTypes.object,
  error: PropTypes.error,
});

// --- MAP STUFF ---

const pos = PropTypes.shape({
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
});

const ray = PropTypes.shape({
  start: pos.isRequired,
  end: pos.isRequired,
});

const circle = PropTypes.shape({
  pos: pos.isRequired,
  radius: PropTypes.number.isRequired,
});

const map = PropTypes.shape({
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
});

const exported = {
  history,
  children,
  error,
  player,
  apiState,
  pos,
  ray,
  circle,
  map,
};
export default exported;
