import { flatten } from 'lodash';
import { handleActions } from 'redux-actions';

import {
  SpecialMarkTypes,
  EventMarkTypes,
} from 'util/MarkMappers';
import RosterPalette from 'util/RosterPalette';

import actions from '../actions';

const initialState = {
  matchId: null,
  rosterPalette: null,
  enabledFilters: null,
  timeRange: null,
};

function makeInitialFilters(rosters) {
  return [
    ...Object.keys(SpecialMarkTypes), // plane, whiteZones, etc...
    ...Object.keys(EventMarkTypes), // Kill, Death, etc...
    // Every player ID, in a flat list
    ...flatten(rosters.map(roster => roster.players.map(player => player.player_id))),
  ];
}


const reducer = handleActions({
  [actions.overview.initMatch]: (state, { payload }) => ({
    matchId: payload.id,
    rosterPalette: new RosterPalette(payload.rosters),
    enabledFilters: makeInitialFilters(payload.rosters),
    timeRange: [0, 0],
  }),
  [actions.overview.setEnabledFilters]: (state, { payload }) => ({
    ...state,
    enabledFilters: payload,
  }),
  [actions.overview.setTimeRange]: (state, { payload }) => ({
    ...state,
    timeRange: payload,
  }),
}, initialState);

export default reducer;
