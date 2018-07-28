import { combineReducers } from 'redux';

import apiReducer from './api/apiReducers';
import overviewReducer from './overview/overviewReducers';

const rootReducer = combineReducers({
  api: apiReducer,
  overview: overviewReducer,
});

export default rootReducer;
