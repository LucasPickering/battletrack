import uniqid from 'uniqid';

const ICONS = Object.freeze({
  Kill: '\uf05b',
  Death: '\uf54c',
  CarePackage: '\uf4cd',
});

function defaultGen(event) {
  return {
    id: uniqid(),
    time: event.time,
  };
}

export default Object.freeze({
  PlayerKill: {
    kill: {
      label: 'Kills',
      generator: ({ attacker, player, ...rest }) => attacker && {
        ...defaultGen(rest),
        pos: attacker.pos,
        player: attacker,
        icon: { code: ICONS.Kill },
        tooltip: {
          title: 'Kill',
          body: [`${ICONS.Kill} ${attacker.name}`, `${ICONS.Death} ${player.name}`],
        },
      },
    },
    death: {
      label: 'Deaths',
      generator: ({ attacker, player, ...rest }) => ({
        ...defaultGen(rest),
        pos: player.pos,
        icon: { code: ICONS.Death },
        player,
        tooltip: {
          title: 'Death',
          body: (attacker ? [`${ICONS.Kill} ${attacker.name}`] : [])
            .concat([`${ICONS.Death} ${player.name}`]),
        },
      }),
    },
  },
  CarePackageLand: {
    carePackage: {
      label: 'Care Packages',
      generator: ({ pos, items, ...rest }) => ({
        ...defaultGen(rest),
        pos,
        icon: { code: ICONS.CarePackage, fill: 'white' },
        tooltip: {
          title: 'Care Package',
          body: items.map(item => item.name),
        },
      }),
    },
  },
});
