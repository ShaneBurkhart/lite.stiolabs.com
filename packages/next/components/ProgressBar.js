import React from 'react';

const ProgressBar = ({ progress, textClassName, barClassName, className, style, value, append, ...rest }) => {
  return (
    <div className={["w-full h-6 bg-gray-200", className || ""].join(" ")} style={style} {...rest} >
      <div
        className={["h-full bg-green-600", barClassName || ""].join(" ")}
        style={{ width: `${progress}%` }}
      >
      <div className="flex justify-between">
        <span className={["pl-2 font-bold text-gray-800", textClassName || ""].join(' ')}>{value || Math.round(progress) + "%"}{append || ""}</span>
      </div>
      </div>
    </div>
  );
};

export default ProgressBar;
