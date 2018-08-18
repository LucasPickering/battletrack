import { noop } from 'lodash';
import React from 'react';

const FilterContext = React.createContext({
  filterVals: {},
  setFilterVal: noop,
});

export default FilterContext;
