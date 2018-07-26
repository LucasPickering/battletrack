import { createActions } from 'redux-actions';

import { objectMap } from 'util/funcs';

const API_ACTION_TYPES = {
  request: 'REQUEST',
  success: 'SUCCESS',
  failure: 'FAILURE',
};

// TODO: Remove the need for this
const ident = a => a;

const API_ACTIONS = {
  REQUEST: ident,
  SUCCESS: ident,
  FAILURE: ident,
};

function createApiActionTypes(base) {
  return objectMap(API_ACTION_TYPES, (key, val) => `${base}/${val}`);
}


// ----- ADD NEW ACTION TYPES HERE - EVERYTHING ELSE IS AUTOMATED -----
const apiActionTypeMappings = {
  player: 'PLAYER',
  match: 'MATCH',
  telemetry: 'TELEMETRY',
};
// ----- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ -----


export const apiActionTypes = objectMap(
  apiActionTypeMappings,
  (key, val) => createApiActionTypes(val),
);

export const apiActions = createActions(
  Object.values(apiActionTypeMappings).reduce((acc, actionType) => {
    acc[actionType] = API_ACTIONS;
    return acc;
  }, {}),
);
