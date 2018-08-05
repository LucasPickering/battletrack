import { max } from 'lodash';

import { playersInRosterPalette, rostersInMatchPalette } from 'util/palette';

class RosterPalette {
  constructor(rosters) {
    // Build an object of playerID:rosterID
    this.playerToRoster = rosters.reduce(
      (acc, { id, players }) => {
        players.forEach(player => { acc[player.player_id] = id; });
        return acc;
      },
      {},
    );
    Object.freeze(this.playerToRoster);

    // Generate a color palette, with one color per roster
    this.rosterColors = {};
    rostersInMatchPalette(rosters.length)
      .forEach((color, index) => {
        this.rosterColors[rosters[index].id] = color;
      });
    Object.freeze(this.rosterColors);

    this.playerColors = {};
    const maxRosterSize = max(rosters.map(r => r.players.length));
    playersInRosterPalette(maxRosterSize)
      .forEach((color, index) => {
        rosters
          .filter(roster => index < roster.players.length)
          .forEach(roster => { this.playerColors[roster.players[index].player_id] = color; });
      });
    Object.freeze(this.playerColors);
  }

  getRosterColor(rosterId) {
    return this.rosterColors[rosterId];
  }

  getRosterColorForPlayer(playerId) {
    return this.getRosterColor(this.playerToRoster[playerId]);
  }

  getPlayerColor(playerId) {
    return this.playerColors[playerId];
  }
}

export default RosterPalette;
