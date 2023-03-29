import React from 'react';

const ProgressBar = ({ progress, barClassName, className, style, value, ...rest }) => {
  return (
    <div className={["w-full h-6 bg-gray-200", className || ""].join(" ")} style={style} {...rest} >
      <div
        className="h-full bg-green-500"
        style={{ width: `${progress}%` }}
      >
      <div className="flex justify-between">
        <span className={["pl-2 font-bold text-gray-800", barClassName].join(' ')}>{value || Math.round(progress) + "%"}</span>
      </div>
      </div>
    </div>
  );
};

export default ProgressBar;
