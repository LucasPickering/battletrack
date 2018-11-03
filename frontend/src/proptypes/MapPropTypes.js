import PropTypes from 'prop-types';
import RosterPalette from 'util/RosterPalette';

const exported = {};

exported.rosterPalette = PropTypes.instanceOf(RosterPalette);

exported.timeRange = PropTypes.arrayOf(PropTypes.number.isRequired); // [min, max]

exported.pos = PropTypes.shape({
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
});

exported.ray = PropTypes.shape({
  start: exported.pos.isRequired,
  end: exported.pos.isRequired,
});

exported.circle = PropTypes.shape({
  pos: exported.pos.isRequired,
  radius: PropTypes.number.isRequired,
});

exported.tooltipContent = PropTypes.arrayOf(PropTypes.shape({
  icon: PropTypes.object,
  text: PropTypes.string,
}));

export default exported;
