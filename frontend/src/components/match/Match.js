import PropTypes from 'prop-types';
import React from 'react';
import { Button, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import {
  formatDate,
  formatSeconds,
  formatGameMode,
  formatPerspective,
  overviewLink,
} from 'util/funcs';
import Localization from 'util/Localization';
import ApiComponent from '../ApiComponent';
import RosterMatchSummary from './RosterMatchSummary';
import 'styles/match/Match.css';

const MatchHelper = props => {
  const {
    matchId,
    matchData: {
      shard,
      mode,
      perspective,
      map: { name: mapName },
      date,
      duration,
      rosters,
    },
  } = props;

  return (
    <div className="match">
      <div className="match-info">
        <h2>{formatGameMode(mode)} {formatPerspective(perspective)}</h2>
        <h2 style={{ textAlign: 'right' }}>{Localization.maps[mapName]}</h2>
        <h3>{formatDate(date)}</h3>
        <h3 style={{ textAlign: 'right' }}>{formatSeconds(duration)}</h3>
      </div>

      <div className="links">
        <Link to={overviewLink(matchId)}>
          <Button>Overview</Button>
        </Link>
      </div>

      <Panel className="rosters">
        {rosters.map(r => <RosterMatchSummary key={r.id} shard={shard} data={r} />)}
      </Panel>
    </div>
  );
};

MatchHelper.propTypes = {
  matchId: PropTypes.string.isRequired,
  matchData: PropTypes.objectOf(PropTypes.any).isRequired,
};

const Match = ({ matchId }) => (
  <ApiComponent
    url={`/api/core/matches/${matchId}`}
    component={MatchHelper}
    dataProp="matchData"
    matchId={matchId}
    loaderText="Loading match..."
  />
);

Match.propTypes = {
  matchId: PropTypes.string.isRequired,
};

export default Match;
