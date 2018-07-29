import PropTypes from 'prop-types';

const history = PropTypes.objectOf(PropTypes.any);

const children = PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]);

// --- API STUFF ---
const error = PropTypes.shape({
  // TODO
});

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

// --- API DATA ---

const roster = PropTypes.shape({
  id: PropTypes.string.isRequired,
  win_place: PropTypes.number.isRequired,
  players: PropTypes.arrayOf(PropTypes.object).isRequired,
});

const player = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
});

const match = PropTypes.shape({
  id: PropTypes.string.isRequired,
  shard: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  perspective: PropTypes.string.isRequired,
  map: map.isRequired,
  date: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  custom_match: PropTypes.bool.isRequired,
  rosters: PropTypes.arrayOf(roster.isRequired).isRequired,
});

const telemetry = PropTypes.shape({
  plane: ray.isRequired,
  zones: PropTypes.arrayOf(circle.isRequired).isRequired,
  events: PropTypes.objectOf(PropTypes.array).isRequired,
});

const exported = {
  history,
  children,
  error,
  player,
  match,
  telemetry,
  apiState,
  pos,
  ray,
  circle,
  map,
};
export default exported;
