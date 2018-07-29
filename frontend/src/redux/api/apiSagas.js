import axios from 'axios';
import {
  all,
  call,
  put,
  takeLatest,
} from 'redux-saga/effects';

import actions from '../actions';
import { apiActionTypes } from './apiActions';

function* fetch(actionGroup, url) {
  try {
    const response = yield call(axios.get, url); // Make the API call
    yield put(actionGroup.success(response.data));
  } catch (e) {
    yield put(actionGroup.failure(e.response));
  }
}

function createFetcher(actionGroup, urlFormatter) {
  return action => fetch(actionGroup, urlFormatter(action.payload));
}

export default function* rootSaga() {
  yield all(Object.entries(apiActionTypes).map(([actionType, urlFormatter]) => {
    const actionGroup = actions.api[actionType];
    return takeLatest(actionGroup.request.toString(), createFetcher(actionGroup, urlFormatter));
  }));
}
