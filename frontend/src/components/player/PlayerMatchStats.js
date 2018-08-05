import React from 'react';

import BtPropTypes from 'util/BtPropTypes';
import { formatSeconds } from 'util/formatters';

import Stat from 'components/Stat';
import 'styles/player/PlayerMatchStats.css';

const PlayerMatchStats = ({
  stats: {
    damage_dealt: damageDealt,
    time_survived: timeSurvived,
    kills,
    ride_distance: rideDistance,
    walk_distance: walkDistance,
  },
}) => (
  <div className="player-match-stats">
    <Stat className="kills" title="Kills" stats={[kills]} />
    <Stat
      className="survived"
      title="Survived"
      stats={[timeSurvived]}
      formatter={formatSeconds}
    />
    <Stat
      className="damage"
      title="Damage"
      stats={[damageDealt]}
      formatter={d => d.toFixed(0)}
    />
    <Stat
      className="traveled"
      title="Traveled"
      stats={[(walkDistance + rideDistance) / 1000]} // Convert to km
      formatter={dist => `${dist.toFixed(2)} km`}
    />
  </div>
);

PlayerMatchStats.propTypes = {
  stats: BtPropTypes.playerMatchStats.isRequired,
};

export default PlayerMatchStats;
