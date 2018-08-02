import { isEqual } from 'lodash';

// eslint-disable-next-line import/prefer-default-export
export function isStateStale(apiState, newParams) {
  const {
    params: oldParams,
    loading,
    data,
    error,
  } = apiState;
  // If load hasn't occurred yet, OR params are outdated, then fetch data
  return (!loading && !data && !error) || !isEqual(oldParams, newParams);
}
