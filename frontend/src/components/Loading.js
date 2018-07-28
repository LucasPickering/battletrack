import React from 'react';
import PropTypes from 'prop-types';
import { ClipLoader } from 'react-spinners';

import BtPropTypes from 'util/BtPropTypes';
import 'styles/Loading.css';

const Loading = ({
  children,
  loading,
  text,
  ...rest
}) => (loading ? (
  <div className="loading">
    <ClipLoader color="var(--highlight-color-2)" loading {...rest} />
    {text && <p className="loading-text">{text}</p>}
    {children}
  </div>
) : null);

Loading.propTypes = {
  children: BtPropTypes.children,
  loading: PropTypes.bool,
  text: PropTypes.string,
  size: PropTypes.number,
};

Loading.defaultProps = {
  children: null,
  loading: true,
  text: null,
  size: 100,
};

export default Loading;
