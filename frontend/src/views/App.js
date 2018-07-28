import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import BtRoute from 'components/BtRoute';

import 'styles/colors.css';
import 'styles/App.css';

import Home from './Home';
import PlayerView from './PlayerView';
import MatchView from './MatchView';
import OverviewView from './OverviewView';
import NotFound from './NotFound';


const App = () => (
  <Router>
    <Switch>
      <BtRoute exact path="/" component={Home} />
      <BtRoute exact path="/players/:shard/:name" component={PlayerView} />
      <BtRoute exact path="/matches/:id" component={MatchView} />
      <BtRoute exact path="/matches/:id/overview" component={OverviewView} fullscreen />
      <Route component={NotFound} />
    </Switch>
  </Router>
);

export default App;
