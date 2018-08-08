import moment from 'moment-timezone';

export const gameModes = [
  { key: 'solo', label: 'Solo' },
  { key: 'duo', label: 'Duo' },
  { key: 'squad', label: 'Squad' },
  { key: 'custom', label: 'Custom Game' },
];

const gameModesObj = gameModes.reduce((acc, { key, label }) => {
  acc[key] = label;
  return acc;
}, {});

export const perspectives = [
  'fpp', // Good
  'tpp', // Scrubs
].map(key => ({ key, label: key.toUpperCase() }));

const perspectivesObj = perspectives.reduce((acc, { key, label }) => {
  acc[key] = label;
  return acc;
}, {});


export function formatDate(date, format = 'MMMM D, YYYY, HH:mm') {
  return moment(date).format(format);
}

export function formatSeconds(seconds, format = 'm[m] ss[s]') {
  return moment.utc(seconds * 1000).format(format);
}

export function formatModePerspective(mode, perspective) {
  // If perspective is populated return "Mode PERSP", otherwise just mode
  const modeStr = gameModesObj[mode];
  return perspective ? `${modeStr} ${perspectivesObj[perspective]}` : modeStr;
}

export function formatShard(shard) {
  return shard.toUpperCase();
}

export function formatItem(item) {
  const { name, stack_count: stackCount } = item;
  return `${stackCount}x ${name}`;
}
