import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';

import '../styles/RosterCheckList.css';

class RosterCheckList extends Component {
  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      expanded: props.rosters.map(roster => roster.id),
    };
  }

  render() {
    const { rosters, enabledPlayers, onChange } = this.props;
    const { expanded } = this.state;
    const nodes = rosters.map(({ id, win_place: winPlace, players }) => ({
      value: id,
      label: `#${winPlace}`,
      children: players.map(({ player_id: playerId, player_name: playerName }) => ({
        value: playerId,
        label: playerName,
      })),
    }));
    return (
      <CheckboxTree
        nodes={nodes}
        checked={enabledPlayers}
        expanded={expanded}
        showNodeIcon={false}
        onCheck={checked => onChange(new Set(checked))}
        onExpand={exp => this.setState({ expanded: exp })}
      />
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
