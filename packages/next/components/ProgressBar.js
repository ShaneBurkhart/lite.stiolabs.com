import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full h-6 bg-gray-200 rounded">
      <div
        className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
