import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Checkbox } from 'react-bootstrap';

import '../styles/RosterCheckList.css';

class RosterCheckList extends Component {
  constructor(...args) {
    super(...args);
    this.renderRoster = this.renderRoster.bind(this);
  }

  setPlayersChecked(event, ...players) {
    const { enabledPlayers, onChange } = this.props;
    const newEnabledPlayers = new Set(enabledPlayers);

    players.forEach(playerId => {
      if (event.target.checked) {
        newEnabledPlayers.add(playerId);
      } else {
        newEnabledPlayers.delete(playerId);
      }
    });
    onChange(newEnabledPlayers);
  }

  renderRoster(roster) {
    const { enabledPlayers } = this.props;
    const { id, win_place: winPlace, players } = roster;

    // Intersect the set of all enabled PIDs with the set of PIDs in this roster
    const enabledInRoster = new Set(players
      .map(player => player.player_id)
      .filter(pid => enabledPlayers.has(pid)));

    return (
      <div className="roster" key={id}>
        <Checkbox
          checked={enabledInRoster.size === players.length}
          onChange={e => this.setPlayersChecked(e, ...players.map(p => p.player_id))}
        />
        <p>#{winPlace}</p>
        <ul className="roster-players">
          {players.map(({ player_id: playerId, player_name: playerName }) => (
            <li className="roster-player" key={playerId}>
              <Checkbox
                checked={enabledInRoster.has(playerId)}
                onChange={e => this.setPlayersChecked(e, playerId)}
              />
              <p>{playerName}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  render() {
    const { rosters } = this.props;
    return (
      <div className="roster-check-list">
        {rosters.map(this.renderRoster)}
      </div>
    );
  }
}

RosterCheckList.propTypes = {
  rosters: PropTypes.arrayOf(PropTypes.object).isRequired,
  enabledPlayers: PropTypes.instanceOf(Set).isRequired,
  onChange: PropTypes.func,
};

RosterCheckList.defaultProps = {
  onChange: () => {},
};

export default RosterCheckList;
