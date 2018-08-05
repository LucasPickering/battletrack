import { capitalize } from 'lodash';
import moment from 'moment-timezone';

export function formatDate(date, format = 'MMMM D, YYYY, HH:mm') {
  return moment(date).format(format);
}

export function formatSeconds(seconds, format = 'm[m] ss[s]') {
  return moment.utc(seconds * 1000).format(format);
}

export function formatGameMode(gameMode) {
  return capitalize(gameMode); // Capitalize first letter
}

export function formatPerspective(perspective) {
  return perspective.toUpperCase();
}

export function formatShard(shard) {
  return shard.toUpperCase();
}

export function formatItem(item) {
  const { name, stack_count: stackCount } = item;
  return `${stackCount}x ${name}`;
}
