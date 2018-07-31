import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { matchLink } from 'util/funcs';

import 'styles/overview/OverviewDrawer.css';

import OverviewFilterList from './OverviewFilterList';
import Icon from '../Icon';


class OverviewDrawer extends React.PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      drawerOpen: true,
    };
  }

  render() {
    const { matchId } = this.props;
    const { drawerOpen } = this.state;
    return (
      <div className="overview-drawer">
        <Button
          className="drawer-button"
          onClick={() => this.setState({ drawerOpen: !drawerOpen })}
        >
          <Icon name={drawerOpen ? 'chevron-left' : 'chevron-right'} />
        </Button>

        {drawerOpen && (
          <div className="drawer-container">
            <Link className="match-link" to={matchLink(matchId)}>
              <Icon name="arrow-left" /> Back To Match
            </Link>
            <OverviewFilterList />
          </div>
        )}
      </div>
    );
  }
}

OverviewDrawer.propTypes = {
  // Redux state
  matchId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  matchId: state.api.match.data.id,
});

export default connect(mapStateToProps)(OverviewDrawer);
