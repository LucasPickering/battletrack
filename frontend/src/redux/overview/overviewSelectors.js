/**
 * Determines if the current overview state is valid. Checks that the current match API data is
 * populated and that its match ID matches that of the overview data.
 *
 * @param      {object}   state   Redux state
 * @return     {bool}     true if overview data is valid, false otherwise.
 */
// eslint-disable-next-line import/prefer-default-export
export function isOverviewValid(state) {
  const matchData = state.api.match.data;
  return matchData && matchData.id === state.overview.matchId;
}
