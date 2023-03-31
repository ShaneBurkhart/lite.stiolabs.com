import React from 'react';
import ProgressCell from './ProgressCell';

const HeaderCell = ({ value, ...props }) => {
  return (
    <ProgressCell header data={value} {...props} />
  );
};

export default HeaderCell;
