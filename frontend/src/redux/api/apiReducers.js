import { combineReducers } from 'redux';

import { objectMap } from 'util/funcs';

import { apiActionTypes } from './apiActions';

const initialApiState = {
  params: null,
  loading: false,
  data: null,
  error: null,
};

function createApiReducer(actionType) {
  return (state = initialApiState, { type, payload }) => {
    switch (type) {
      case actionType.request:
        return {
          params: payload,
          loading: true,
          data: null,
          error: null,
        };
      case actionType.success:
        return {
          ...state,
          loading: false,
          data: payload,
        };
      case actionType.failure:
        return {
          ...state,
          loading: false,
          error: payload,
        };
      default:
        return state;
    }
  };
}

// Map each API action type to a reducer
const rootReducer = combineReducers(objectMap(
  apiActionTypes,
  (key, val) => createApiReducer(val),
));

export default rootReducer;
