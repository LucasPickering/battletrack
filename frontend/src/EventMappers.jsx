import React from 'react';

import CarePackageMark from './components/CarePackageMark';

export default Object.freeze({
  PlayerKill: {
    death: {
      label: 'Deaths',
      generator: ({ player, ...rest }) => ({
        icon: <text className="icon">&#xf00d;</text>,
        pos: player.pos,
        player,
        ...rest,
      }),
    },
    kill: {
      label: 'Kills',
      generator: ({ attacker, ...rest }) => attacker && {
        icon: <text className="icon">&#xf05b;</text>,
        pos: attacker.pos,
        player: attacker,
        ...rest,
      },
    },
  },
  CarePackageLand: {
    carePackage: {
      label: 'Care Packages',
      generator: event => ({
        icon: <CarePackageMark />,
        ...event,
      }),
    },
  },
});
