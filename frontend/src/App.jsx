import React from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';

import BtRoute from './components/BtRoute';
import Home from './components/Home';
import Match from './components/Match';
import MatchOverview from './components/MatchOverview';
import Player from './components/Player';
import './styles/App.css';


const App = () => (
  <Router>
    <Switch>
      <BtRoute exact path="/" component={Home} />
      <BtRoute exact path="/matches/:matchId" component={Match} />
      <BtRoute exact path="/matches/:matchId/overview" component={MatchOverview} fullscreen />
      <BtRoute exact path="/players/:shard/:playerName" component={Player} />
    </Switch>
  </Router>
);

export default App;
