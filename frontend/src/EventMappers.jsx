import React from 'react';

export default Object.freeze({
  PlayerKill: {
    death: {
      label: 'Deaths',
      generator: ({ player, time }) => ({
        icon: <text className="fa">&#xf00d;</text>,
        pos: player.pos,
        time,
        player,
      }),
    },
    kill: {
      label: 'Kills',
      generator: ({ attacker, time }) => attacker && {
        icon: <text className="fa">&#xf05b;</text>,
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
        icon: <text className="fa">&#xf4cd;</text>,
        pos,
        time,
      }),
    },
  },
});
