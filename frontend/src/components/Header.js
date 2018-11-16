import React from 'react';

import PlayerSearch from './PlayerSearch';
import 'styles/Header.css';

const Header = () => (
  <div className="bt-header">
    <p className="bt-logo">Battletrack</p>
    <p className="beta-tag">BETA</p>
    <PlayerSearch />
    <a
      className="gitlab-icon"
      href="https://gitlab.com/LucasPickering/battletrack"
    >
      <img
        src="https://gitlab.com/gitlab-com/gitlab-artwork/raw/master/logo/logo-square.svg"
        alt="GitLab"
      />
    </a>
  </div>
);

export default Header;
