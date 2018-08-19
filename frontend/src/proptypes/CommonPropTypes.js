import PropTypes from 'prop-types';

const exported = {};

exported.history = PropTypes.objectOf(PropTypes.any);

exported.size = PropTypes.oneOf(['small', 'medium', 'large']);

exported.placement = PropTypes.oneOf(['left', 'right']);

exported.children = PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]);

exported.filterCfg = PropTypes.shape({
  key: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  extractor: PropTypes.func.isRequired,
});

exported.filterCfgs = PropTypes.arrayOf(exported.filterCfg.isRequired);

export default exported;
