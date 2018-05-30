import PropTypes from 'prop-types';
import React from 'react';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';

import { SpecialMarkTypes, EventMarkTypes } from '../util/MarkMappers';
import Localization from '../util/Localization';
import RosterPalette from '../util/RosterPalette';
import '../styles/FilterCheckList.css';

class FilterCheckList extends React.PureComponent {
  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      expanded: ['filters', 'rosters'],
    };
  }

  buildRosterNodes() {
    const { rosters, rosterPalette } = this.props;

    // Check if this is a solo game - this will affect how we show the list
    if (Math.max(...rosters.map(roster => roster.players.length)) > 1) {
      // One node per roster, one sub-node per player
      return rosters.map(({ id, win_place: winPlace, players }) => ({
        value: id,
        label: `#${winPlace}`,
        icon: <i className="fa fa-users" style={{ color: rosterPalette.getRosterColor(id) }} />,
        children: players.map(({ player_id: playerId, player_name: playerName }) => ({
          value: playerId,
          label: playerName,
          icon: (
            <i
              className="fa fa-user"
              style={{ color: rosterPalette.getPlayerColor(playerId) }}
            />
          ),
        })),
      }));
    }

    // There is only one player per roster, so don't nest them.
    return rosters.map(({
      win_place: winPlace,
      players: [{ player_id: playerId, player_name: playerName }],
    }) => ({
      value: playerId,
      label: `#${winPlace} - ${playerName}`,
      icon: (
        <i
          className="fa fa-user"
          style={{ color: rosterPalette.getRosterColorForPlayer(playerId) }}
        />
      ),
    }));
  }

  render() {
    const {
      enabledPlayers,
      onChange,
    } = this.props;
    const { expanded } = this.state;

    // Special filters (plane, zones, etc.)
    const specialFilterNodes = Object.entries(SpecialMarkTypes).map(([
      key,
      { icon: { code: iconCode, ...iconProps } },
    ]) => ({
      value: key,
      label: Localization.specialMarks[key],
      icon: <p className="fa" {...iconProps}>{iconCode}</p>,
    }));

    // Event type filters
    const eventFilterNodes = Object.entries(EventMarkTypes).map(([
      key,
      { icon: { code: iconCode, ...iconProps } },
    ]) => ({
      value: key,
      label: Localization.eventMarks[key].plural,
      icon: <p className="fa" {...iconProps}>{iconCode}</p>,
    }));

    const nodes = [
      {
        value: 'filters',
        label: 'Filters',
        icon: <i className="fa fa-filter" />,
        children: specialFilterNodes.concat(eventFilterNodes),
      },
      {
        value: 'rosters',
        label: 'Rosters',
        icon: <i className="fa fa-users" />,
        children: this.buildRosterNodes(),
      },
    ];

    return (
      <div className="filter-list">
        <CheckboxTree
          nodes={nodes}
          checked={enabledPlayers}
          expanded={expanded}
          onCheck={checked => onChange(checked)}
          onExpand={exp => this.setState({ expanded: exp })}
        />
      </div>
    );
  }
}

FilterCheckList.propTypes = {
  rosters: PropTypes.arrayOf(PropTypes.object).isRequired,
  rosterPalette: PropTypes.instanceOf(RosterPalette).isRequired,
  enabledPlayers: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func,
};

FilterCheckList.defaultProps = {
  onChange: () => {},
};

export default FilterCheckList;
