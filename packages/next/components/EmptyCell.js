import React from 'react';

const EmptyCell = ({ ...rest }) => {
  return (
    <div
      className="w-full px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
      style={{ height: '35px' }}
      {...rest}
    />
  );
};

export default EmptyCell;
