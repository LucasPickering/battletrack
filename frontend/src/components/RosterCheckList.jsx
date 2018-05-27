import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';

import RosterPalette from '../util/RosterPalette';
import '../styles/RosterCheckList.css';

class RosterCheckList extends Component {
  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      expanded: props.rosters.map(roster => roster.id),
    };
  }

  render() {
    const {
      rosters,
      rosterPalette,
      enabledPlayers,
      onChange,
    } = this.props;
    const { expanded } = this.state;

    // One node per roster, one sub-node per player
    const nodes = rosters.map(({ id, win_place: winPlace, players }) => {
      const color = rosterPalette.getRosterColor(id);
      return ({
        value: id,
        label: `#${winPlace}`,
        icon: <i className="fa fa-users" style={{ color }} />,
        children: players.map(({ player_id: playerId, player_name: playerName }) => ({
          value: playerId,
          label: playerName,
          icon: <i className="fa fa-user" style={{ color: rosterPalette.getPlayerColor(playerId) }} />,
        })),
      });
    });

    return (
      <CheckboxTree
        nodes={nodes}
        checked={enabledPlayers}
        expanded={expanded}
        onCheck={checked => onChange(checked)}
        onExpand={exp => this.setState({ expanded: exp })}
      />
    );
  }
}

RosterCheckList.propTypes = {
  rosters: PropTypes.arrayOf(PropTypes.object).isRequired,
  rosterPalette: PropTypes.instanceOf(RosterPalette).isRequired,
  enabledPlayers: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func,
};

RosterCheckList.defaultProps = {
  onChange: () => {},
};

export default RosterCheckList;
