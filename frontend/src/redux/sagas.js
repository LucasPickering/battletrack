import axios from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import { ActionTypes } from './actions';

function* fetchPlayer(action) {
  try {
    // Make the API call
    const data = yield call(
      ({ shard, name }) => axios.get(`/api/core/players/${shard}/${name}?popMatches`),
      action.payload,
    );

    yield put({ type: ActionTypes.player.success, payload: data.data });
  } catch (e) {
    yield put({ type: ActionTypes.player.failure, payload: e.response });
  }
}

export default function* rootSaga() {
  yield takeLatest(ActionTypes.player.request, fetchPlayer);
}
