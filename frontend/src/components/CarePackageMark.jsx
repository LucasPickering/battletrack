import React from 'react';

const SCALE = 20;
const STRAP_OFFSET = 0.3;

const CarePackageMark = () => (
  <g transform={`scale(${SCALE})`}>
    <rect width={1} height={1} fill="#90210e" />
    <rect width={1} height={0.3} fill="#135b8d" />
    <path d={`M${STRAP_OFFSET},0 V1 Z`} stroke="#221a2f" strokeWidth={1 / 20} />
    <path d={`M${1 - STRAP_OFFSET},0 V1 Z`} stroke="#221a2f" strokeWidth={1 / 20} />
  </g>
);

export default CarePackageMark;
