import uniqid from 'uniqid';

const ICONS = Object.freeze({
  Kill: '\uf05b',
  Death: '\uf54c',
  CarePackage: '\uf4cd',
});

function deathTooltip(attacker, player) {
  // Attacker element is only included if attacker is non-null
  return (attacker ? [`${ICONS.Kill} ${attacker.name}`] : [])
    .concat([`${ICONS.Death} ${player.name}`]);
}

export const MarkTypes = Object.freeze({
  Kill: {
    labels: { single: 'Kill', plural: 'Kills' },
    icon: { code: ICONS.Kill },
    convert: ({ attacker, player }) => attacker && {
      pos: attacker.pos,
      player: attacker,
      tooltip: deathTooltip(attacker, player),
    },
  },
  Death: {
    labels: { single: 'Death', plural: 'Deaths' },
    icon: { code: ICONS.Death },
    convert: ({ attacker, player }) => ({
      pos: player.pos,
      player,
      tooltip: deathTooltip(attacker, player),
    }),
  },
  CarePackage: {
    labels: { single: 'CarePackage', plural: 'Care Packages' },
    icon: { code: ICONS.CarePackage, fill: 'white' },
    convert: ({ pos, items }) => ({
      pos,
      tooltip: items.map(item => `${item.stack_count}x ${item.name}`),
    }),
  },
});

export const EventTypes = Object.freeze({
  PlayerKill: ['Kill', 'Death'],
  CarePackageLand: ['CarePackage'],
});

export function convertEvent(markType, event) {
  const { convert, ...staticFields } = MarkTypes[markType];
  const dynamicFields = convert(event); // Calculate dynamic mark fields based on the event

  // Combine static and dynamic fields into one object. If the dynamic object is null, then just
  // return null.
  return dynamicFields ? {
    type: markType,
    id: uniqid(),
    ...staticFields,
    time: event.time,
    ...dynamicFields,
  } : null;
}
