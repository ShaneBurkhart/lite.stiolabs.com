import React from 'react';

const HeaderCell = ({ value, dark, className, onClick }) => {
  const classNames = [
    "w-full h-9 border border-gray-400 px-2 py-1 text-sm bg-gray-200 font-semibold text-gray-700 leading-none",
    dark ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700",
    className || "",
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
