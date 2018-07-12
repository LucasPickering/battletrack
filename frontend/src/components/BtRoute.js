import PropTypes from 'prop-types';
import React from 'react';
import { Route } from 'react-router-dom';

import BtPropTypes from 'util/BtPropTypes';
import Header from './Header';
import 'styles/BtRoute.css';

const PageWrapper = ({ children }) => (
  <div className="bt-page-wrapper full-size">
    <Header />
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
  const comp = ({ match, ...rest }) => {
    const el = React.createElement(component, { ...match.params, ...rest });
    return fullscreen ? el : <PageWrapper>{el}</PageWrapper>;
  };
  comp.propTypes = {
    match: PropTypes.shape({ params: PropTypes.object.isRequired }).isRequired,
  };

  return comp;
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
