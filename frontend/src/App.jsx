import axios from 'axios';
import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Match from './components/Match';
import Player from './components/Player';
import PlayerSearch from './components/PlayerSearch';
import './styles/App.css';

axios.baseURL = 'localhost:4000';

const App = () => (
  <div className="App">
    <PlayerSearch />
    <Switch>
        <Route exact path="/" component={null} />
        <Route path="/matches/:matchId" component={Match} />
        <Route path="/players/:playerName" component={Player} />
    </Switch>
  </div>
);

export default App;
