import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Match from './components/Match';
import Player from './components/Player';
import PlayerSearch from './components/PlayerSearch';
import './styles/App.css';


const App = () => (
  <Router>
    <div className="App">
      <PlayerSearch />
      <Switch>
        <Route exact path="/" component={null} />
        <Route exact path="/matches/:matchId" component={Match} />
        <Route exact path="/players/:shard/:playerName" component={Player} />
      </Switch>
    </div>
  </Router>
);

export default App;
