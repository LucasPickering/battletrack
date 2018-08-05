import { mapValues } from 'lodash';
import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';

import actions from '../actions';
import { apiActionTypes } from './apiActions';

const initialApiState = {
  params: undefined,
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
      ...payload, // Contains params and data
    }),
    [actionGroup.failure]: (state, { payload }) => ({
      ...state,
      loading: false,
      ...payload, // Contains params and error
    }),
  }, initialApiState);
}

const reducer = combineReducers(mapValues(apiActionTypes, (val, key) => createApiReducer(key)));

export default reducer;
