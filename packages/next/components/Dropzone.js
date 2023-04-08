import React, { useCallback } from "react";
import { useDropzone, useProgressBar } from "react-dropzone";

function Dropzone({ onDrop }) {
  const handleDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        onDrop({ file, data: reader.result });
      };
      reader.readAsDataURL(file);
    });
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple: true,
  });

  const { progress, getRootProps: getProgressBarProps } = useProgressBar({
    size: 5,
    style: {
      backgroundColor: "lightgray",
      height: "100%",
    },
    className: "rounded-full",
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <div className="flex flex-col justify-center items-center h-full">
          <div className="border border-gray-300 rounded-lg p-4 border-dashed cursor-pointer">
            <div className="text-2xl font-bold">Upload a set of plans (PDF)</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-full">
          <div
            {...getProgressBarProps()}
            style={{ width: `${progress}%` }}
          />
          <div className="border border-gray-300 rounded-lg p-4 border-dashed cursor-pointer">
            <div className="text-2xl font-bold">Upload a set of plans (PDF)</div>
            <div className="text-sm">Click here or drag your files here</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dropzone;
