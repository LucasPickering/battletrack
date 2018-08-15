import React from 'react';

import PlayerSearch from './PlayerSearch';
import 'styles/Header.css';

const Header = () => (
  <div className="bt-header">
    <p className="bt-logo">Battletrack</p>
    <p className="beta-tag">BETA</p>
    <PlayerSearch />
  </div>
);

export default Header;
