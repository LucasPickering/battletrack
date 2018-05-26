import palette from 'google-palette';

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
    palette('rainbow', rosters.length, 0, 0.8, 0.7) // Set saturation/value manually
      .map(c => `#${c}`).forEach((color, index) => {
        this.rosterColors[rosters[index].id] = color;
      });
    Object.freeze(this.rosterColors);
  }

  getRosterColor(rosterId) {
    return this.rosterColors[rosterId];
  }

  getPlayerColor(playerId) {
    return this.getRosterColor(this.playerToRoster[playerId]);
  }
}

export default RosterPalette;
