import React from 'react';
import uniqid from 'uniqid';

import Ray from 'components/map/Ray';
import Zones from 'components/map/Zones';
import Localization from './Localization';

const ICONS = Object.freeze({
  Kill: '\uf05b',
  Death: '\uf54c',
  Position: '\uf192',
  CarePackage: '\uf4cd',
  Plane: '\uf072',
  Circle: '\uf111',
});

function deathTooltip(event) {
  const { attacker, player, damage_causer: damageCauser } = event;
  // Attacker element is only included if attacker is non-null
  return (attacker ? [`${ICONS.Kill} ${attacker.name}`] : [])
    .concat([`${ICONS.Death} ${player.name}`, `\uf35a ${Localization.damageCausers[damageCauser]}`]);
}

export const SpecialMarkTypes = Object.freeze({
  plane: {
    label: 'Plane',
    icon: { code: ICONS.Plane },
    render: (plane, { lineScale, ...rest }) => (
      <Ray {...plane} color="white" showTailTip weight={1.5} {...rest} />
    ),
  },
  whiteZones: {
    label: 'Play Zones',
    icon: { code: ICONS.Circle, style: { fontWeight: 400 } },
    render: (zones, props) => (
      <Zones circles={zones} color="white" fill={false} weight={1.5} {...props} />
    ),
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
    icon: { code: ICONS.Kill },
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
    icon: { code: ICONS.Death },
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
    icon: { code: ICONS.CarePackage },
    convert: ({ pos, items }) => ({
      pos,
      tooltip: items.map(item => `${item.stack_count}x ${Localization.items[item.name]}`),
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
    id: uniqid(),
    ...staticFields,
    time: event.time,
    ...dynamicFields,
  } : null;
}
