import React from 'react';
import ProgressBar from './ProgressBar';

const Cell = ({ progress, dark, className, ...rest }) => {
  const classNames = [
    "cursor-pointer border h-9 border-gray-600",
    dark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700",
    className,
  ]

  const barClassNames = [
    "text-gray-800",
    dark ? "text-white" : "text-gray-700",
  ].join(' ')

  return (
    <ProgressBar progress={progress} barClassName={barClassNames} className={classNames.join(' ')} {...rest} /> 
  )
  // return (
  //   <input
  //     type="text"
  //     value={value}
  //     onChange={onChange}
  //     onFocus={onFocus}
  //     onBlur={onBlur}
  //     className="w-full border border-gray-400 border-b-gray-100 border-l-gray-100 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
	// 		style={{ height: '35px' }}
  //     {...rest}
  //   />
  // );
};

export default Cell;
