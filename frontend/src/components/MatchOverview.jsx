import palette from 'google-palette';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Checkbox, Panel, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Slider from 'rc-slider';
import uniqid from 'uniqid';
import 'rc-slider/assets/index.css';

import {
  formatSeconds,
  matchLink,
  inRange,
  range,
} from '../util';
import ApiComponent from './ApiComponent';
import RosterCheckList from './RosterCheckList';
import GameMap from './GameMap';
import Ray from './Ray';
import KillEvent from './KillEvent';
import CarePackageEvent from './CarePackageEvent';
import Zone from './Zone';
import '../styles/MatchOverview.css';

const Range = Slider.createSliderWithTooltip(Slider.Range); // Janky AF

const DISPLAY_FILTERS = [
  'Circles',
  'Plane',
  'Kills',
  'Deaths',
  'Care Packages',
];

const EVENT_TYPES = Object.freeze({
  PlayerKill: { component: KillEvent, filters: ['Kills', 'Deaths'] },
  CarePackageLand: { component: CarePackageEvent, filters: ['Care Packages'] },
});

class MatchOverviewHelper extends Component {
  constructor(props, context) {
    super(props, context);

    const { telemetry: { match: { duration, rosters } } } = props;
    this.state = {
      timeRange: [0, duration], // Time range to display events in
      displayFilters: DISPLAY_FILTERS.slice(), // Copy the array
      enabledPlayers: rosters.reduce(
        (acc, roster) => {
          roster.players.forEach(player => acc.add(player.player_id));
          return acc;
        },
        new Set(),
      ),
    };

    this.displayFilterEnabled = this.displayFilterEnabled.bind(this);
  }

  displayFilterEnabled(filterName) {
    return this.state.displayFilters.includes(filterName);
  }

  renderTimeRange() {
    const { telemetry: { match: { duration } } } = this.props;
    const { timeRange } = this.state;

    // Build an object of marks to put on the slider
    const marks = {};
    range(0, duration, 300).forEach(i => {
      marks[i] = formatSeconds(i, 'm[m]');
    });
    marks[duration] = formatSeconds(duration, 'm[m]'); // Add the final mark

    return (
      <Range
        count={1}
        max={duration}
        defaultValue={timeRange}
        onAfterChange={newRange => this.setState({ timeRange: newRange })}
        allowCross={false}
        marks={marks}
        tipFormatter={formatSeconds}
      />
    );
  }

  renderFilterButtons() {
    const { displayFilters } = this.state;
    return (
      <ToggleButtonGroup
        className="filter-buttons"
        type="checkbox"
        value={displayFilters}
        onChange={val => this.setState({ displayFilters: val })}
      >
        {DISPLAY_FILTERS.map(e => (
          <ToggleButton key={e} value={e}>{e}</ToggleButton>
        ))}
      </ToggleButtonGroup>
    );
  }

  renderPlayerList() {
    const { telemetry: { match: { rosters } } } = this.props;
    const { enabledPlayers } = this.state;
    return (
      <Panel className="player-list">
        <RosterCheckList
          rosters={rosters}
          enabledPlayers={enabledPlayers}
          onChange={val => this.setState({ enabledPlayers: val })}
        />
      </Panel>
    );
  }

  renderSvg() {
    const {
      telemetry: {
        match: { map_name: mapName, rosters },
        plane,
        zones,
        events,
      },
    } = this.props;
    const { timeRange: [minTime, maxTime] } = this.state;
    const timeFilter = e => inRange(e.time, minTime, maxTime); // Used to filter events by time

    // Generate a color palette, with one color per roster
    const playerColors = {};
    palette('tol-rainbow', rosters.length).map(c => `#${c}`).forEach((color, index) => {
      rosters[index].players.forEach(player => {
        playerColors[player.player_id] = color;
      });
    });
    Object.freeze(playerColors);

    return (
      <GameMap className="map" mapName={mapName}>
        {this.displayFilterEnabled('Plane') &&
          <Ray start={plane.start} end={plane.end} color="white" showTailTip />}
        {this.displayFilterEnabled('Circles') &&
          zones.map(zone => <Zone key={uniqid()} circle={zone} stroke="#ffffff" />)}

        {Object.entries(EVENT_TYPES).map(([type, v]) => {
          const { component, filters: componentFilters } = v;
          // Figure out which filter buttons relevant to this event are enabled
          const enabledFilters = componentFilters.filter(this.displayFilterEnabled);

          // If any of the relevant filters are enabled, render all the objects
          if (enabledFilters.length > 0) {
            return events[type]
              .filter(timeFilter) // Filter by time
              .map(event => React.createElement(component, {
                  key: uniqid(),
                  event,
                  playerColors,
                  filters: enabledFilters,
              }));
          }
          return null; // Nothing to render
        })}
      </GameMap>
    );
  }

  render() {
    const { matchId } = this.props;
    return (
      <Panel className="overview">
        <Link className="match-link" to={matchLink(matchId)}><h3>Back to Match</h3></Link>
        {this.renderTimeRange()}
        {this.renderFilterButtons()}
        {this.renderPlayerList()}
        <br />
        {this.renderSvg()}
      </Panel>
    );
  }
}

MatchOverviewHelper.propTypes = {
  matchId: PropTypes.string.isRequired,
  telemetry: PropTypes.objectOf(PropTypes.any).isRequired,
};

const MatchOverview = ({ matchId }) => (
  <ApiComponent
    url={`/api/telemetry/${matchId}?events=${Object.keys(EVENT_TYPES).join()}`}
    component={MatchOverviewHelper}
    dataProp="telemetry"
    matchId={matchId}
  />
);

MatchOverview.propTypes = {
  matchId: PropTypes.string.isRequired,
};

export default MatchOverview;
