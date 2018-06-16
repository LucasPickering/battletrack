import PropTypes from 'prop-types';

const children = PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]);

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
  children,
  pos,
  ray,
  circle,
  map,
};
export default exported;
