import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { routeComponent } from './util';
import Match from './components/Match';
import MatchOverview from './components/MatchOverview';
import Player from './components/Player';
import PlayerSearch from './components/PlayerSearch';
import './styles/App.css';


const App = () => (
  <Router>
    <div className="App">
      <PlayerSearch />
      <Switch>
        <Route exact path="/" component={null} />
        <Route exact path="/matches/:matchId" render={routeComponent(Match)} />
        <Route exact path="/matches/:matchId/overview" render={routeComponent(MatchOverview)} />
        <Route exact path="/players/:shard/:playerName" render={routeComponent(Player)} />
      </Switch>
    </div>
  </Router>
);

export default App;
