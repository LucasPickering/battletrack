import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import { matchLink } from 'util/funcs';
import FilterCheckList from '../map/FilterCheckList';
import Icon from '../Icon';

const OverviewDrawer = ({ matchId, ...rest }) => (
  <div className="left-container">
    <Link className="match-link" to={matchLink(matchId)}>
      <Icon name="arrow-left" /> Back To Match
    </Link>
    <FilterCheckList {...rest} />
  </div>
);

OverviewDrawer.propTypes = {
  matchId: PropTypes.string.isRequired,
};

export default OverviewDrawer;
