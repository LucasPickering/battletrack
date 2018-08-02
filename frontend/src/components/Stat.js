import React from 'react';
import { identity } from 'lodash';
import PropTypes from 'prop-types';
import uniqid from 'uniqid';

const Stat = props => {
  const {
    title,
    stats,
    formatter,
    ...rest
  } = props;
  return (
    <ul {...rest}>
      <li><b>{title}</b></li>
      {stats.map(stat => <li key={uniqid()}>{formatter(stat)}</li>)}
    </ul>
  );
};

Stat.propTypes = {
  title: PropTypes.string.isRequired,
  stats: PropTypes.arrayOf(PropTypes.any).isRequired,
  formatter: PropTypes.func,
};

Stat.defaultProps = {
  formatter: identity,
};

export default Stat;
