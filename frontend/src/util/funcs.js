export function inRangeIncl(x, min, max) {
  return min <= x && x <= max;
}

export function toLeaflet(pos) {
  return [pos.x, pos.y];
}
