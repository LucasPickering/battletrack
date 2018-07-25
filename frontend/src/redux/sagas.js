import { fork } from 'redux-saga/effects';

import apiSagas from './api/apiSagas';

export default function* rootSaga() {
  yield fork(apiSagas);
}
