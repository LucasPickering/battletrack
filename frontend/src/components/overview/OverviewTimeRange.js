import React from 'react';
import { range } from 'lodash';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import actions from 'redux/actions';
import BtPropTypes from 'util/BtPropTypes';
import {
  formatSeconds,
} from 'util/funcs';

import Range from 'components/Range';
import 'styles/overview/OverviewTimeRange.css';

class OverviewTimeRange extends React.PureComponent {
  constructor(...args) {
    super(...args);
    this.buildMarks();
  }

  componentDidUpdate(prevProps) {
    const { matchDuration } = this.props;
    // If match duration changed, we need to recalculate marks
    if (prevProps.matchDuration !== matchDuration) {
      this.buildMarks();
    }
  }

  buildMarks() {
    const { matchDuration, setTimeRange } = this.props;
    // Sometimes the final event(s) of a match can take place after the duration, e.g. the duration
    // is 1906 but the final kill occurs at 1906.1. Add one to make sure we capture every event.
    this.maxTime = matchDuration + 1;

    // Build an object of marks to put on the slider, at regular time intervals
    this.timeMarks = {};
    range(0, this.maxTime, 5 * 60).forEach(i => {
      this.timeMarks[i] = formatSeconds(i, 'm[m]');
    });
    this.timeMarks[this.maxTime] = formatSeconds(this.maxTime, 'm[m]'); // Add the final mark
    setTimeRange([0, this.maxTime]);
  }

  render() {
    const { timeRange, setTimeRange } = this.props;
    return (
      <Range
        className="overview-time-range"
        count={1}
        max={this.maxTime}
        value={timeRange}
        onChange={setTimeRange}
        marks={this.timeMarks}
        tipFormatter={formatSeconds}
      />
    );
  }
}

OverviewTimeRange.propTypes = {
  // Redux state
  matchDuration: PropTypes.number.isRequired,
  timeRange: BtPropTypes.timeRange.isRequired, // [min, max]

  // Redux actions
  setTimeRange: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  matchDuration: state.api.match.data.duration,
  timeRange: state.overview.timeRange,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setTimeRange: actions.overview.setTimeRange,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(OverviewTimeRange);
