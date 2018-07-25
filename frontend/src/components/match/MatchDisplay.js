import React from 'react';
import PropTypes from 'prop-types';
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

import RosterMatchSummary from './RosterMatchSummary';

const MatchDisplay = ({
  data: {
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

MatchDisplay.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired, // TODO
};

export default MatchDisplay;
