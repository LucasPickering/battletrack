import axios from 'axios';
import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import Player from './components/Player';
import PlayerSearch from './components/PlayerSearch';
import './styles/App.css';

axios.baseURL = 'localhost:4000';

class App extends Component {
  render() {
    return (
      <div className="App">
        <PlayerSearch />
        <Switch>
            <Route exact path="/" component={null} />
            <Route path="/players/:playerName" component={Player} />
        </Switch>
      </div>
    );
  }
}

export default App;
