import { createActions } from 'redux-actions';

import { objectMap } from 'util/funcs';

const API_ACTIONS = {
  request: 'REQUEST',
  success: 'SUCCESS',
  failure: 'FAILURE',
};

function createApiActionTypes(base) {
  return objectMap(API_ACTIONS, (key, val) => `${base}/${val}`);
}

export const ActionTypes = {
  player: createApiActionTypes('PLAYER'),
};

export const Actions = createActions({
  PLAYER: {
    REQUEST: (shard, name) => ({ shard, name }),
    SUCCESS: data => ({ data }),
    FAILURE: error => ({ error }),
  },
});
