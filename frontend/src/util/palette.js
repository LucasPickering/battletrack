import palette from 'google-palette';

function toCss(pal) {
  return pal.map(c => `#${c}`);
}

export function playersInRosterPalette(size) {
  return toCss(palette('mpn65', size));
}

export function rostersInMatchPalette(size) {
  return toCss(palette('tol-rainbow', size)
    .reverse()); // Reverse it so that better teams get brighter colors
}
