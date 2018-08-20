export function makeLabels(keys, labelMaker) { // Thanks Jeff
  return keys.map(key => ({ key, label: labelMaker(key) }));
}

export function inRangeIncl(x, min, max) {
  return min <= x && x <= max;
}

export function toLeaflet(pos) {
  return [pos.x, pos.y];
}
