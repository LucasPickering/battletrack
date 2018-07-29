import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';

import { objectMap } from 'util/funcs';

import actions from '../actions';
import { apiActionTypes } from './apiActions';

const initialApiState = {
  params: null,
  loading: false,
  data: null,
  error: null,
};

function createApiReducer(actionType) {
  const actionGroup = actions.api[actionType];
  return handleActions({
    [actionGroup.request]: (state, { payload }) => ({
      params: payload,
      loading: true,
      data: null,
      error: null,
    }),
    [actionGroup.success]: (state, { payload }) => ({
      ...state,
      loading: false,
      data: payload,
    }),
    [actionGroup.failure]: (state, { payload }) => ({
      ...state,
      loading: false,
      error: payload,
    }),
  }, initialApiState);
}

const rootReducer = combineReducers(objectMap(apiActionTypes, createApiReducer));

export default rootReducer;
