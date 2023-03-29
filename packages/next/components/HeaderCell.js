import React from 'react';

const HeaderCell = ({ value, dark, className, onClick }) => {
  const classNames = [
    className || "",
    "w-full h-9 border border-gray-400 px-2 py-1 text-sm bg-gray-200 font-semibold text-center text-gray-700",
    dark ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700",
  ]
  return (
    <div
      className={classNames.join(' ')}
      onClick={onClick}
    >
      {value}
    </div>
  );
};

export default HeaderCell;
