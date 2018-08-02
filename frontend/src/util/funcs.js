import { capitalize } from 'lodash';
import moment from 'moment-timezone';

// TODO: Replace this with a call to the API
export const SHARDS = Object.freeze([
  'pc-na',
  'pc-eu',
  'pc-as',
  'pc-kakao',
  'pc-krjp',
  'pc-jp',
  'pc-oc',
  'pc-ru',
  'pc-sa',
  'pc-sea',
]);

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

export function mapImage(mapKey) {
  return `/assets/maps/${mapKey}.jpg`;
}

export function matchLink(matchId) {
  return `/matches/${matchId}`;
}

export function overviewLink(matchId) {
  return `${matchLink(matchId)}/overview`;
}

export function playerLink(shard, playerName) {
  return `/players/${shard}/${playerName}`;
}

export function inRangeIncl(x, min, max) {
  return min <= x && x <= max;
}

export function toLeaflet(pos) {
  return [pos.x, pos.y];
}
