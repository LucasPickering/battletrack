import PropTypes from 'prop-types';

import MapPropTypes from './MapPropTypes';

const exported = {};

// TODO eliminate common fields between these

exported.map = PropTypes.shape({
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
});

exported.roster = PropTypes.shape({
  id: PropTypes.string.isRequired,
  win_place: PropTypes.number.isRequired,
  players: PropTypes.arrayOf(PropTypes.object).isRequired,
});

exported.player = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
});

exported.match = PropTypes.shape({
  id: PropTypes.string.isRequired,
  shard: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  perspective: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  custom_match: PropTypes.bool.isRequired,
  map: exported.map.isRequired,
  rosters: PropTypes.arrayOf(exported.roster.isRequired),
});

exported.matchSummary = PropTypes.shape({
  shard: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  perspective: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  custom_match: PropTypes.bool.isRequired,
  map_name: PropTypes.string.isRequired,
  roster_count: PropTypes.number.isRequired,
});

exported.playerMatchStats = PropTypes.objectOf(PropTypes.any); // TODO

exported.playerMatch = PropTypes.shape({
  match_id: PropTypes.string.isRequired,
  summary: exported.matchSummary.isRequired,
  roster: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  stats: exported.playerMatchStats.isRequired,
});

exported.telemetry = PropTypes.shape({
  plane: MapPropTypes.ray.isRequired,
  zones: PropTypes.arrayOf(MapPropTypes.circle.isRequired).isRequired,
  events: PropTypes.objectOf(PropTypes.array).isRequired,
});

export default exported;
