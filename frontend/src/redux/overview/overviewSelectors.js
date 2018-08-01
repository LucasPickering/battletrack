/**
 * Determines if the overview should be initialized. This happens if there IS match data, but the
 * overview data hasn't been initialized on that match. If there is no data or the overview data has
 * been initialized on the present match, returns false.
 *
 * @param      {object}  state   Redux state
 * @return     {bool}    true if overview data can and should be initialized, false otherwise
 */
// eslint-disable-next-line import/prefer-default-export
export function shouldInitOverview(state) {
  const matchData = state.api.match.data;
  return Boolean(matchData) && matchData.id !== state.overview.matchId;
}
