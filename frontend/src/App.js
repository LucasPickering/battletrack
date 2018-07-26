import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import PlayerView from 'views/PlayerView';
import MatchView from 'views/MatchView';
import MatchOverviewView from 'views/MatchOverviewView';
import NotFound from './components/NotFound';

import 'styles/colors.css';
import 'styles/App.css';

import BtRoute from './components/BtRoute';
import Home from './components/Home';


const App = () => (
  <Router>
    <Switch>
      <BtRoute exact path="/" component={Home} />
      <BtRoute exact path="/players/:shard/:name" component={PlayerView} />
      <BtRoute exact path="/matches/:id" component={MatchView} />
      <BtRoute exact path="/matches/:id/overview" component={MatchOverviewView} fullscreen />
      <Route component={NotFound} />
    </Switch>
  </Router>
);

export default App;
