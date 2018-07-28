import { objectMap } from 'util/funcs';
import { EventTypes } from 'util/MarkMappers';

const API_ACTIONS = {
  // undefined means use identity function
  request: undefined,
  success: undefined,
  failure: undefined,
};

// ADD NEW API DATA TYPES HERE (key to URL formatter)
export const apiActionTypes = {
  player: ({ shard, name }) => `/api/core/players/${shard}/${name}?popMatches`,
  match: ({ id }) => `/api/core/matches/${id}`,
  telemetry: ({ id }) => `/api/telemetry/${id}?events=${Object.keys(EventTypes).join()}`,
};

const apiActions = objectMap(
  apiActionTypes,
  () => API_ACTIONS,
);

export default apiActions;
