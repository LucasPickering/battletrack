import { createActions } from 'redux-actions';

import { objectMap } from 'util/funcs';

const API_ACTIONS = {
  request: 'REQUEST',
  success: 'SUCCESS',
  failure: 'FAILURE',
};

const ident = a => a;

const API_ACTION = {
  REQUEST: ident,
  SUCCESS: ident,
  FAILURE: ident,
};

function createApiActionTypes(base) {
  return objectMap(API_ACTIONS, (key, val) => `${base}/${val}`);
}

export const ActionTypes = {
  player: createApiActionTypes('PLAYER'),
  match: createApiActionTypes('MATCH'),
};

// TODO: Automate
export const Actions = createActions({
  PLAYER: API_ACTION,
  MATCH: API_ACTION,
});
