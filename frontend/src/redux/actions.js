import { createActions } from 'redux-actions';

import apiActions from './api/apiActions';
import overviewActions from './overview/overviewActions';

const actions = createActions({
  api: apiActions,
  overview: overviewActions,
});

export default actions;
