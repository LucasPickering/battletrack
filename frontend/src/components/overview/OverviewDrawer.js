import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { matchLink } from 'util/funcs';

import 'styles/overview/OverviewDrawer.css';

import OverviewFilterList from './OverviewFilterList';
import Icon from '../Icon';


const OverviewDrawer = ({ matchId }) => (
  <div className="overview-drawer">
    <Link className="match-link" to={matchLink(matchId)}>
      <Icon name="arrow-left" /> Back To Match
    </Link>
    <OverviewFilterList />
  </div>
);

OverviewDrawer.propTypes = {
  // Redux state
  matchId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  matchId: state.api.match.data.id,
});

export default connect(mapStateToProps)(OverviewDrawer);
