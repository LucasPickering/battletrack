import React from 'react';
import { max } from 'lodash';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';

import actions from 'redux/actions';
import { SpecialMarkTypes, EventMarkTypes } from 'util/MarkMappers';
import Localization from 'util/Localization';
import RosterPalette from 'util/RosterPalette';

import Icon from 'components/Icon';
import 'styles/overview/OverviewFilterList.css';

const ROSTER_ICON = 'users';
const PLAYER_ICON = 'user';

class OverviewFilterList extends React.PureComponent {
  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      expanded: ['filters', 'rosters'],
    };

    this.buildNodes();
  }

  componentDidUpdate(prevProps) {
    const { rosters } = this.props;
    // If the roster list changes, build new checklist nodes
    if (prevProps.rosters !== rosters) {
      this.buildNodes();
    }
  }

  buildNodes() {
    const { rosters, rosterPalette } = this.props;

    // Special filters (plane, zones, etc.)
    const specialFilterNodes = Object.entries(SpecialMarkTypes).map(([
      key,
      { icon }, // Props for the Icon component
    ]) => ({
      value: key,
      label: Localization.specialMarks[key],
      icon: <Icon {...icon} />,
    }));

    // Event type filters
    const eventFilterNodes = Object.entries(EventMarkTypes).map(([
      key,
      { icon }, // Props for the Icon component
    ]) => ({
      value: key,
      label: Localization.eventMarks[key].plural,
      icon: <Icon {...icon} />,
    }));

    // Roster nodes
    let rosterNodes;
    // Check if this is a solo game - this will affect how we show the list
    if (max(rosters.map(r => r.players.length)) > 1) {
      // More than one player per roster - build one node per roster and one sub-node per player
      rosterNodes = rosters.map(({ id, win_place: winPlace, players }) => ({
        value: id,
        label: `#${winPlace}`,
        icon: <Icon name={ROSTER_ICON} color={rosterPalette.getRosterColor(id)} />,
        children: players.map(({ player_id: playerId, player_name: playerName }) => ({
          value: playerId,
          label: playerName,
          icon: <Icon name={PLAYER_ICON} color={rosterPalette.getPlayerColor(playerId)} />,
        })),
      }));
    } else {
      // There is only one player per roster, so don't nest them.
      rosterNodes = rosters.map(({
        win_place: winPlace,
        players: [{ player_id: playerId, player_name: playerName }], // players is a list of 1
      }) => ({
        value: playerId,
        label: `#${winPlace} - ${playerName}`,
        icon: <Icon name={PLAYER_ICON} color={rosterPalette.getRosterColorForPlayer(playerId)} />,
      }));
    }

    this.nodes = [
      {
        value: 'filters',
        label: 'Filters',
        icon: <Icon name="filter" />,
        children: specialFilterNodes.concat(eventFilterNodes),
      },
      {
        value: 'rosters',
        label: 'Rosters',
        icon: <Icon name={ROSTER_ICON} />,
        children: rosterNodes,
      },
    ];
  }

  render() {
    const {
      enabledFilters,
      setEnabledFilters,
    } = this.props;
    const { expanded } = this.state;

    return (
      <div className="overview-filter-list">
        <CheckboxTree
          nodes={this.nodes}
          checked={enabledFilters}
          expanded={expanded}
          onCheck={setEnabledFilters}
          onExpand={exp => this.setState({ expanded: exp })}
        />
      </div>
    );
  }
}

OverviewFilterList.propTypes = {
  // Redux state
  rosters: PropTypes.arrayOf(PropTypes.object).isRequired,
  rosterPalette: PropTypes.instanceOf(RosterPalette).isRequired,
  enabledFilters: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Redux actions
  setEnabledFilters: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  rosters: state.api.match.data.rosters,
  rosterPalette: state.overview.rosterPalette,
  enabledFilters: state.overview.enabledFilters,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setEnabledFilters: actions.overview.setEnabledFilters,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(OverviewFilterList);
