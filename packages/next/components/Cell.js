import React from 'react';

const Cell = ({ value, onChange, onFocus, onBlur, ...rest }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      className="w-full border border-gray-400 border-b-gray-100 border-l-gray-100 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
			style={{ height: '35px' }}
      {...rest}
    />
  );
};

export default Cell;
