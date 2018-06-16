import PropTypes from 'prop-types';
import React from 'react';
import { Route } from 'react-router-dom';

import BtPropTypes from '../util/BtPropTypes';
import PlayerSearch from './PlayerSearch';
import '../styles/BtRoute.css';

const PageWrapper = ({ children }) => (
  <div className="bt-page-wrapper full-size">
    <div className="beta-tag">
      <p>BETA</p>
    </div>
    <PlayerSearch />
    <div className="child-container">
      {children}
    </div>
  </div>
);

PageWrapper.propTypes = {
  children: BtPropTypes.children,
};

PageWrapper.defaultProps = {
  children: null,
};

function routeComponent(component, fullscreen) {
  return ({ match, ...rest }) => {
    const el = React.createElement(component, { ...match.params, ...rest });
    return fullscreen ? el : <PageWrapper>{el}</PageWrapper>;
  };
}

const BtRoute = props => {
  const {
    component,
    fullscreen,
    ...rest
  } = props;
  return (
    <Route
      render={routeComponent(component, fullscreen)}
      {...rest}
    />
  );
};

BtRoute.propTypes = {
  component: PropTypes.func.isRequired,
  fullscreen: PropTypes.bool,
};

BtRoute.defaultProps = {
  fullscreen: false,
};

export default BtRoute;
