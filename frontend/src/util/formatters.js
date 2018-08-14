import moment from 'moment-timezone';

export const gameModes = [
  { key: 'solo', label: 'Solo' },
  { key: 'duo', label: 'Duo' },
  { key: 'squad', label: 'Squad' },
  { key: 'custom', label: 'Custom Game' },
];

export const gameModesObj = gameModes.reduce((acc, { key, label }) => {
  acc[key] = label;
  return acc;
}, {});

export const perspectives = [
  'fpp', // Good
  'tpp', // Scrubs
].map(key => ({ key, label: key.toUpperCase() }));

export const perspectivesObj = perspectives.reduce((acc, { key, label }) => {
  acc[key] = label;
  return acc;
}, {});


export function formatDate(date, format = 'MMMM D, YYYY, HH:mm') {
  return moment(date).format(format);
}

export function formatSeconds(seconds, format = 'm[m] ss[s]') {
  return moment.utc(seconds * 1000).format(format);
}

export function formatShard(shard) {
  return shard.toUpperCase();
}

export function formatItem(item) {
  const { name, stack_count: stackCount } = item;
  return `${stackCount}x ${name}`;
}
