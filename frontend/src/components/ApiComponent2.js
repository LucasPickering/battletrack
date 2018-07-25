import React from 'react';

function paramsEqual(p1, p2) {
  return Object.entries(p1).every(([k, v]) => v === p2[k]);
}

class ApiComponent extends React.PureComponent {
  constructor(props, context, fetchData, dataKey, paramKeys) {
    super(props, context);
    this.fetchData = fetchData;
    this.dataKey = dataKey;
    this.paramKeys = paramKeys;
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate() {
    this.loadData();
  }

  loadData() {
    const {
      params: oldParams,
      loading,
      data,
      error,
    } = this.props[this.dataKey];
    const newParams = this.paramKeys.reduce((acc, key) => {
      acc[key] = this.props[key];
      return acc;
    }, {});

    // If there is no data and no error (load hasn't happened yet), OR params are outdated,
    // fetch data for the current params
    if ((!data && !error && !loading) || !paramsEqual(oldParams, newParams)) {
      this.fetchData(newParams);
    }
  }
}

export default ApiComponent;
