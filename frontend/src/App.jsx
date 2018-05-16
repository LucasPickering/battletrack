import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import api from './api';
import Match from './components/Match';
import Player from './components/Player';
import PlayerSearch from './components/PlayerSearch';
import './styles/App.css';


class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      consts: null, // Shards, maps, etc. pulled from API
    };
  }

  componentWillMount() {
    api.get('/api/core/consts')
      .then(response => this.setState({ consts: response.data }))
      .catch(console.error);
  }

  withConsts(component) {
    return (props => React.createElement(component, { consts: this.state.consts, ...props }));
  }

  render() {
    return this.state.consts && (
      <Router>
        <div className="App">
          <PlayerSearch />
          <Switch>
            <Route exact path="/" component={null} />
            <Route exact path="/matches/:matchId" render={this.withConsts(Match)} />
            <Route exact path="/players/:shard/:playerName" render={this.withConsts(Player)} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
