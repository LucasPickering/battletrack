import React from 'react';
import { Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import DataPropTypes from 'proptypes/DataPropTypes';
import { formatDate } from 'util/formatters';
import { matchLink } from 'util/links';
import Localization from 'util/Localization';

import ModePerspective from 'components/ModePerspective';
import 'styles/match/MatchSummary.css';

const MatchSummary = props => {
  const { match } = props;
  const {
    match_id: matchId,
    mode,
    perspective,
    map_name: mapName,
    date,
  } = match;

  return (
    <Panel className="match-summary">
      <Link to={matchLink(matchId)}>
        <Panel.Heading>
          <Panel.Title>
            <ModePerspective mode={mode} perspective={perspective} />
          </Panel.Title>
          <Panel.Title style={{ textAlign: 'right' }}>
            {formatDate(date)}
          </Panel.Title>
          <Panel.Title>{Localization.maps[mapName]}</Panel.Title>
        </Panel.Heading>
      </Link>
    </Panel>
  );
};

MatchSummary.propTypes = {
  match: DataPropTypes.match.isRequired,
};

export default MatchSummary;
