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

/**
 * Determines if array empty.
 *
 * @param      {array}   arr     The arr
 * @return     {boolean}  True if array empty, False otherwise.
 */
export function isArrayEmpty(arr) {
  return arr.length === 0;
}

/**
 * Flattens an array of array sinto one flat array. Ex: [[1, 2], [3, 4]] => [1, 2, 3, 4]
 * TODO: Delete this in favor of Array.flat() when more browsers get support
 *
 * @param      {array}  arr     The array to flatten
 * @return     {array}  The flattened array
 */
export function flattenArray(arr) {
  return [].concat(...arr);
}

/**
 * Determines if object empty.
 *
 * @param      {object}   obj     The object
 * @return     {boolean}  True if object empty, False otherwise.
 */
export function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Applies the given transformation function over each value in the given object. Returns a new
 * object with the same keys, and each corresponding value transformed by the function.
 *
 * @param      {object}    obj     The object
 * @param      {Function}  func    The function ((key, val) => newVal)
 * @return     {object}    the transformed object
 */
export function objectMap(obj, func) {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    acc[key] = func(key, val);
    return acc;
  }, {});
}

/**
 * Filters entries in the given object with the given function. Returns a new object with the
 * entries that passed the predicated.
 *
 * @param      {object}    obj     The object
 * @param      {Function}  pred    The predicate ((key, val) => bool)
 * @return     {object}    filtered object
 */
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
