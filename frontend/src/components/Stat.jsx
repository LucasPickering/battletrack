import PropTypes from 'prop-types';
import React from 'react';

const Stat = props => {
  const {
    title,
    stats,
    formatter,
    ...rest
  } = props;
  return (
    <ul className="stat" {...rest}>
      <li><b>{title}</b></li>
      {stats.map((stat, index) => <li key={index}>{formatter(stat)}</li>)}
    </ul>
  );
};

Stat.propTypes = {
  title: PropTypes.string.isRequired,
  stats: PropTypes.arrayOf(PropTypes.any).isRequired,
  formatter: PropTypes.func,
};

Stat.defaultProps = {
  formatter: (e => e),
};

export default Stat;
