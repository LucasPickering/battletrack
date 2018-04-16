import axios from 'axios';
import React, { Component } from 'react';
import logo from './logo.svg';
import './styles/App.css';

import MatchSearch from './components/MatchSearch';

axios.baseURL = 'localhost:4000';

class App extends Component {
  render() {
    return (
      <div className="App">
        <MatchSearch />
      </div>
    );
  }
}

export default App;
