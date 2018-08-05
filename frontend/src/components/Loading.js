import React from 'react';
import PropTypes from 'prop-types';
import { ClipLoader } from 'react-spinners';

import BtPropTypes from 'util/BtPropTypes';
import 'styles/Loading.css';

const Loading = ({
  children,
  loading,
  loadingComp,
  text,
  ...rest
}) => (loading ? (
  <div className="loading">
    {React.createElement(loadingComp, {
      loading: true,
      color: 'var(--highlight-color-1)',
      ...rest,
    })}
    {text && <p className="loading-text">{text}</p>}
    {children}
  </div>
) : null);

Loading.propTypes = {
  children: BtPropTypes.children,
  loading: PropTypes.bool,
  loadingComp: PropTypes.func,
  text: PropTypes.string,
  size: PropTypes.number,
};

Loading.defaultProps = {
  children: null,
  loading: true,
  loadingComp: ClipLoader,
  text: null,
  size: 100,
};

export default Loading;
