import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import 'styles/MatchPlacement.css';

const MatchPlacement = ({
  winPlace,
  rosterCount,
  link,
}) => (
  <div className="match-placement">
    <Link className="win-place" to={link}>#{winPlace}</Link>
    <p className="roster-count">/{rosterCount}</p>
  </div>
);

MatchPlacement.propTypes = {
  winPlace: PropTypes.number.isRequired,
  rosterCount: PropTypes.number.isRequired,
  link: PropTypes.string.isRequired,
};

export default MatchPlacement;
