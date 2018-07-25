import moment from 'moment-timezone';

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
  return gameMode.charAt(0).toUpperCase() + gameMode.slice(1); // Capitalize first letter
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

export function objectMap(obj, func) {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    acc[key] = func(key, val);
    return acc;
  }, {});
}

export function objectFilter(obj, pred) {
  return Object.entries(obj)
    .reduce((acc, [key, val]) => {
      if (pred(key, val)) {
        acc[key] = val;
      }
      return acc;
    }, {});
}

export function objectEqualShallow(o1, o2) {
  // TODO finish
  return Object.entries(o1).every(([k, v]) => v === o2[k]);
}

export function isApiStatusStale(newParams, apiStatus) {
  const {
    params: oldParams,
    loading,
    data,
    error,
  } = apiStatus;
  // If load hasn't occurred yet, OR params are outdated, then fetch data
  return (!loading && !data && !error) || !objectEqualShallow(oldParams, newParams);
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

export function inRange(x, min, max) {
  return min <= x && x <= max;
}

export function range(start, end, step = 1) {
  const rv = new Array(Math.ceil((end - start) / step)); // Pre-allocate necessary space
  for (let i = start; i < end; i += step) {
    rv.push(i);
  }
  return rv;
}

export function toLeaflet(pos) {
  return [pos.x, pos.y];
}
