// eslint-disable-next-line import/prefer-default-export
export function isOverviewStale(overview, matchId) {
  return overview.matchId !== matchId;
}
