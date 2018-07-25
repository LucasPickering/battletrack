import { combineReducers } from 'redux';

import { ActionTypes } from './actions';

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

// TODO: Automate
const rootReducer = combineReducers({
  player: createApiReducer(ActionTypes.player),
  match: createApiReducer(ActionTypes.match),
});

export default rootReducer;
