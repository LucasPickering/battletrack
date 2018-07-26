import axios from 'axios';
import {
  all,
  call,
  put,
  takeLatest,
} from 'redux-saga/effects';

import { EventTypes } from 'util/MarkMappers';

import { apiActionTypes, apiActions } from './apiActions';

function* fetch(actionGroup, url) {
  try {
    const response = yield call(axios.get, url); // Make the API call
    yield put(actionGroup.success(response.data));
  } catch (e) {
    yield put(actionGroup.failure(e.response));
  }
}

function* fetchPlayer(action) {
  const { shard, name } = action.payload;
  yield* fetch(apiActions.player, `/api/core/players/${shard}/${name}?popMatches`);
}

function* fetchMatch(action) {
  const { id } = action.payload;
  yield* fetch(apiActions.match, `/api/core/matches/${id}`);
}

function* fetchTelemetry(action) {
  const { id } = action.payload;
  yield* fetch(
    apiActions.telemetry,
    `/api/telemetry/${id}?events=${Object.keys(EventTypes).join()}`,
  );
}

export default function* rootSaga() {
  yield all([
    takeLatest(apiActionTypes.player.request, fetchPlayer),
    takeLatest(apiActionTypes.match.request, fetchMatch),
    takeLatest(apiActionTypes.telemetry.request, fetchTelemetry),
  ]);
}
