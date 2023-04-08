import React from 'react';

const SVGButton = ({ selected=false, highlighted=false, onClick=null, svgIcon, disabled=false, title="", className="", innerText="" }) => {
  let selectedClass = highlighted ? "bg-blue-500 bg-opacity-90" : selected ? "bg-blue-700" : "bg-gray-900";

  return (
    <button
      className={`flex items-center justify-center ${className} h-10 text-white p-2 ${selectedClass} disabled:bg-gray-900 hover:bg-blue-600 disabled:shadow-inner disabled:hover:bg-gray-800 disabled:cursor-not-allowed focus:outline-none`}
      type="button"
      disabled={disabled}
      onClick={e => { if (onClick) onClick(e) }}
      title={title}
    >
      <div className="flex flex-0 items-center justify-center">{svgIcon}</div>
      {!!innerText && <div className="ml-4 text-sm flex-1 flex flex-start">{innerText}</div>}
    </button>
  );
};

export default SVGButton;
