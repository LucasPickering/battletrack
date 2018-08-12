import uniqid from 'uniqid';

import Plane from 'components/map/Plane';
import WhiteZones from 'components/map/WhiteZones';

import Localization from './Localization';

const ICONS = Object.freeze({
  Plane: { name: 'plane' },
  PlayZone: { name: 'circle', format: 'regular' },
  Kill: { name: 'crosshairs' },
  Death: { name: 'skull' },
  DeathCause: { name: 'arrow-alt-circle-right' }, // TODO Find a better icon
  Position: { name: 'dot-circle' },
  CarePackage: { name: 'parachute-box' },
});

function deathTooltip(event) {
  const { attacker, player, damage_causer: damageCauser } = event;
  // Attacker element is only included if attacker is non-null
  return [
    ...(attacker ? [{ icon: ICONS.Kill, text: attacker.name }] : []),
    { icon: ICONS.Death, text: player.name },
    { icon: ICONS.DeathCause, text: Localization.damageCausers[damageCauser] },
  ];
}

export const SpecialMarkTypes = Object.freeze({
  plane: {
    label: 'Plane',
    icon: ICONS.Plane,
    component: Plane,
  },
  whiteZones: {
    label: 'Play Zones',
    icon: ICONS.PlayZone,
    component: WhiteZones,
  },
});

export const EventMarkTypes = Object.freeze({
  // PlayerPosition: {
  //   icon: { code: ICONS.Position, fontSize: 4, fontWeight: 400 },
  //   convert: ({ player }) => ({
  //     pos: player.pos,
  //     player,
  //     tooltip: [player.name],
  //   }),
  // },
  Kill: {
    icon: ICONS.Kill,
    convert: event => {
      const { attacker } = event;
      return attacker && {
        pos: attacker.pos,
        player: attacker,
        tooltip: deathTooltip(event),
      };
    },
  },
  Death: {
    icon: ICONS.Death,
    convert: event => {
      const { player } = event;
      return {
        pos: player.pos,
        player,
        tooltip: deathTooltip(event),
      };
    },
  },
  CarePackage: {
    icon: ICONS.CarePackage,
    convert: ({ pos, items }) => ({
      pos,
      tooltip: items.map(item => ({
        icon: { name: 'dot-circle', format: 'regular' }, // TODO
        text: `${item.stack_count}x ${Localization.items[item.name]}`,
      })),
    }),
  },
});

export const EventTypes = Object.freeze({
  // PlayerPosition: ['PlayerPosition'],
  PlayerKill: ['Kill', 'Death'],
  CarePackageLand: ['CarePackage'],
});

export function convertEvent(markType, event) {
  const { convert, ...staticFields } = EventMarkTypes[markType];
  const dynamicFields = convert(event); // Calculate dynamic mark fields based on the event

  // Combine static and dynamic fields into one object. If the dynamic object is null, then just
  // return null.
  return dynamicFields ? {
    type: markType,
    key: uniqid(),
    ...staticFields,
    time: event.time,
    ...dynamicFields,
  } : null;
}
