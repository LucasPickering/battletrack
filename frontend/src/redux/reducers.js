import { combineReducers } from 'redux';

import apiReducer from './api/apiReducers';

const rootReducer = combineReducers({
  api: apiReducer,
});

export default rootReducer;
