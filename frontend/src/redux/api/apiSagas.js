import axios from 'axios';
import { flatten, isEqual } from 'lodash';
import {
  all,
  call,
  put,
  select,
  takeLatest,
} from 'redux-saga/effects';

import { getApiState } from './apiSelectors';
import actions from '../actions';
import { apiActionTypes } from './apiActions';

function* fetch(actionGroup, urlFormatter, payload) {
  const url = urlFormatter(payload);
  try {
    const response = yield call(axios.get, url); // Make the API call
    // Re-pass params to prevent race conditions
    yield put(actionGroup.success({ params: payload, data: response.data }));
  } catch (e) {
    // Re-pass params to prevent race conditions
    yield put(actionGroup.failure({ params: payload, error: e.response }));
  }
}

function* fetchIfNeeded(actionType, actionGroup, payload) {
  const {
    params: oldParams,
    loading,
    data,
    error,
  } = yield select(getApiState, actionType);
  // If we haven't fetched anything, OR the params have changed, fetch data
  if ((!loading && !data && !error) || !isEqual(oldParams, payload)) {
    yield put(actionGroup.request(payload));
  }
}

function createFetchersForAction([actionType, urlFormatter]) {
  const actionGroup = actions.api[actionType];
  return [
    // Regular request saga
    takeLatest(
      actionGroup.request.toString(),
      action => fetch(actionGroup, urlFormatter, action.payload),
    ),
    // Request-if-needed saga
    takeLatest(
      actionGroup.requestIfNeeded.toString(),
      action => fetchIfNeeded(actionType, actionGroup, action.payload),
    ),
  ];
}

function createFetchers() {
  return flatten(Object.entries(apiActionTypes).map(createFetchersForAction));
}

export default function* rootSaga() {
  yield all(createFetchers());
}
