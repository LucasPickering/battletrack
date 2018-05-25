import PropTypes from 'prop-types';

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

const exported = { pos, ray, circle };
export default exported;
