import React from 'react';
import uniqid from 'uniqid';

function defaultGen(event, iconCode) {
  return {
    id: uniqid(),
    icon: <text className="fa">{iconCode}</text>,
    time: event.time,
  };
}

export default Object.freeze({
  PlayerKill: {
    death: {
      label: 'Deaths',
      generator: ({ player, ...rest }) => ({
        ...defaultGen(rest, '\uf00d'),
        pos: player.pos,
        player,
      }),
    },
    kill: {
      label: 'Kills',
      generator: ({ attacker, ...rest }) => attacker && {
        ...defaultGen(rest, '\uf05b'),
        pos: attacker.pos,
        player: attacker,
      },
    },
  },
  CarePackageLand: {
    carePackage: {
      label: 'Care Packages',
      generator: ({ pos, ...rest }) => ({
        ...defaultGen(rest, '\uf4cd'),
        pos,
      }),
    },
  },
});
