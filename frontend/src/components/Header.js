import React from 'react';
import { Link } from 'react-router-dom';

import PlayerSearch from './PlayerSearch';
import 'styles/Header.css';

const Header = () => (
  <div className="bt-header">
    <Link className="bt-logo" to="/">
      Battletrack
    </Link>
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
