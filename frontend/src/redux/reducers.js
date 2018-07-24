import { combineReducers } from 'redux';

import { ActionTypes } from './actions';

const initialPlayerState = {
  shard: null,
  name: null,
  loading: false,
  data: null,
  error: null,
};

const playerReducer = (state = initialPlayerState, { type, payload }) => {
  switch (type) {
    case ActionTypes.player.request:
      return {
        ...state,
        ...payload,
        loading: true,
        data: null,
        error: null,
      };
    case ActionTypes.player.success:
      return {
        ...state,
        loading: false,
        data: payload,
      };
    case ActionTypes.player.failure:
      return {
        ...state,
        loading: false,
        error: payload,
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  player: playerReducer,
});

export default rootReducer;
