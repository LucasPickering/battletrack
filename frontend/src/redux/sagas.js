import axios from 'axios';
import {
  all,
  call,
  put,
  takeLatest,
} from 'redux-saga/effects';

import { ActionTypes, Actions } from './actions';

function* fetchApi(actionGroup, url) {
  try {
    const response = yield call(axios.get, url); // Make the API call
    yield put(actionGroup.success(response.data));
  } catch (e) {
    yield put(actionGroup.failure(e.response));
  }
}

function* fetchPlayer(action) {
  const { shard, name } = action.payload;
  yield* fetchApi(Actions.player, `/api/core/players/${shard}/${name}?popMatches`);
}

function* fetchMatch(action) {
  const { id } = action.payload;
  yield* fetchApi(Actions.match, `/api/core/matches/${id}`);
}

export default function* rootSaga() {
  yield all([
    takeLatest(ActionTypes.player.request, fetchPlayer),
    takeLatest(ActionTypes.match.request, fetchMatch),
  ]);
}
