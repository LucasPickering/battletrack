import uniqid from 'uniqid';

function defaultGen(event, iconCode, iconProps = {}) {
  return {
    id: uniqid(),
    icon: { code: iconCode, ...iconProps },
    time: event.time,
  };
}

export default Object.freeze({
  PlayerKill: {
    kill: {
      label: 'Kills',
      generator: ({ attacker, ...rest }) => attacker && {
        ...defaultGen(rest, '\uf05b'),
        pos: attacker.pos,
        player: attacker,
      },
    },
    death: {
      label: 'Deaths',
      generator: ({ player, ...rest }) => ({
        ...defaultGen(rest, '\uf54c'),
        pos: player.pos,
        player,
      }),
    },
  },
  CarePackageLand: {
    carePackage: {
      label: 'Care Packages',
      generator: ({ pos, ...rest }) => ({
        ...defaultGen(rest, '\uf4cd', { fill: '#b70505', stroke: 'white', strokeWidth: 0.8 }),
        pos,
      }),
    },
  },
});
