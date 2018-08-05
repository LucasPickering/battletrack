import React from 'react';
import { Button, Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import BtPropTypes from 'util/BtPropTypes';
import {
  formatDate,
  formatSeconds,
  formatGameMode,
  formatPerspective,
} from 'util/formatters';
import { overviewLink } from 'util/links';
import Localization from 'util/Localization';
import 'styles/match/Match.css';

import RosterMatchSummary from './RosterMatchSummary';

const Match = ({
  match: {
    id,
    shard,
    mode,
    perspective,
    map: { name: mapName },
    date,
    duration,
    rosters,
  },
}) => (
  <div className="match">
    <div className="match-info">
      <h2>{formatGameMode(mode)} {formatPerspective(perspective)}</h2>
      <h2 style={{ textAlign: 'right' }}>{Localization.maps[mapName]}</h2>
      <h3>{formatDate(date)}</h3>
      <h3 style={{ textAlign: 'right' }}>{formatSeconds(duration)}</h3>
    </div>

    <div className="links">
      <Link to={overviewLink(id)}>
        <Button>Overview</Button>
      </Link>
    </div>

    <Panel className="rosters">
      {rosters.map(r => <RosterMatchSummary key={r.id} shard={shard} data={r} />)}
    </Panel>
  </div>
);

Match.propTypes = {
  match: BtPropTypes.match.isRequired,
};

const mapStateToProps = state => ({
  match: state.api.match.data,
});

export default connect(mapStateToProps)(Match);
