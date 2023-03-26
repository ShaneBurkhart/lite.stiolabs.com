import React from 'react';

const HeaderCell = ({ value, onClick }) => {
  return (
    <div
      className="w-full h-9 border border-gray-400 border-b-2 border-l-2 px-2 py-1 text-sm bg-gray-200 font-semibold text-center text-gray-700"
      onClick={onClick}
    >
      {value}
    </div>
  );
};

export default HeaderCell;
