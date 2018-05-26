import React from 'react';

import CarePackageMark from './components/CarePackageMark';

export default Object.freeze({
  PlayerKill: {
    death: {
      label: 'Deaths',
      generator: ({ player, time }) => ({
        icon: <text className="icon">&#xf00d;</text>,
        pos: player.pos,
        time,
        player,
      }),
    },
    kill: {
      label: 'Kills',
      generator: ({ attacker, time }) => attacker && {
        icon: <text className="icon">&#xf05b;</text>,
        pos: attacker.pos,
        time,
        player: attacker,
      },
    },
  },
  CarePackageLand: {
    carePackage: {
      label: 'Care Packages',
      generator: ({ pos, time }) => ({
        icon: <CarePackageMark />,
        pos,
        time,
      }),
    },
  },
});
