import PropTypes from 'prop-types';
import RosterPalette from 'util/RosterPalette';

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

const rosterPalette = PropTypes.instanceOf(RosterPalette);

const timeRange = PropTypes.arrayOf(PropTypes.number.isRequired); // [min, max] TODO enforce length

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

const tooltipContent = PropTypes.arrayOf(PropTypes.shape({
  icon: PropTypes.object.isRequired,
  text: PropTypes.string.isRequired,
}));

// --- API DATA ---

// TODO eliminate common fields between these, move them into their own file

const map = PropTypes.shape({
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
});

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
  date: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  custom_match: PropTypes.bool.isRequired,
  map: map.isRequired,
  rosters: PropTypes.arrayOf(roster.isRequired),
});

const matchSummary = PropTypes.shape({
  shard: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  perspective: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  custom_match: PropTypes.bool.isRequired,
  map_name: PropTypes.string.isRequired,
  roster_count: PropTypes.number.isRequired,
});

const playerMatchStats = PropTypes.objectOf(PropTypes.any); // TODO

const playerMatch = PropTypes.shape({
  match_id: PropTypes.string.isRequired,
  summary: matchSummary.isRequired,
  roster: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  stats: playerMatchStats.isRequired,
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
  pos,
  ray,
  circle,
  tooltipContent,
  map,
  player,
  match,
  matchSummary,
  playerMatchStats,
  playerMatch,
  telemetry,
  apiState,
  rosterPalette,
  timeRange,
};
export default exported;
