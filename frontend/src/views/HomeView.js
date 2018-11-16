import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ApiDataComponent from 'components/ApiDataComponent';
import RecentMatches from 'components/RecentMatches';
import actions from 'redux/actions';
import ApiView from './ApiView';

import 'styles/HomeView.css';

class HomeView extends ApiView {
  updateData() {
    const { fetchRecentMatchesIfNeeded } = this.props;
    fetchRecentMatchesIfNeeded();
  }

  render() {
    const { recentMatchesState } = this.props;
    return (
      <div className="home">
        <h1>Battletrack</h1>
        <div className="recent-matches">
          <h4 className="recent-matches-label">Recent Matches</h4>
          <ApiDataComponent
            component={RecentMatches}
            state={recentMatchesState}
            loadingText="Loading matches..."
            className="recent-matches"
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  recentMatchesState: state.api.recentMatches,
});

const mapDispatchToProps = dispatch => bindActionCreators(
  {
    fetchRecentMatchesIfNeeded: actions.api.recentMatches.requestIfNeeded,
  },
  dispatch,
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeView);
