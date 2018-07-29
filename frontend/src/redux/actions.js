import { createActions } from 'redux-actions';

import { apiActions } from './api/apiActions';

const actions = createActions({
  api: apiActions,
});

export default actions;
