import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import BtRoute from './components/BtRoute';
import Home from './components/Home';
import Match from './components/match/Match';
import MatchOverview from './components/match/MatchOverview';
import Player from './components/player/Player';
import NotFound from './components/NotFound';
import 'styles/colors.css';
import 'styles/App.css';


const App = () => (
  <Router>
    <Switch>
      <BtRoute exact path="/" component={Home} />
      <BtRoute exact path="/matches/:id" component={Match} />
      <BtRoute exact path="/matches/:id/overview" component={MatchOverview} fullscreen />
      <BtRoute exact path="/players/:shard/:name" component={Player} />
      <Route component={NotFound} />
    </Switch>
  </Router>
);

export default App;
