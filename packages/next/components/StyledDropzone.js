import React, { useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  outline: 'none',
};

const activeStyle = {
};

const acceptStyle = {
};

const rejectStyle = {
};

function StyledDropzone({ onDrop, accept, acceptMultiple=true, maxFiles=50 }) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
      accept: (accept !== null) ? accept || 'image/*' : undefined,
      onDrop: onDrop,
      maxFiles
    });
  
            
  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject
  ]);

  return (
    <div {...getRootProps({style})}>
      <div className="p-5 text-center text-gray-400 border-2 border-gray-200 border-dashed rounded cursor-pointer bg-gray-50 hover:border-brightGreen hover:text-brightGreen">
          <input {...getInputProps()} multiple={acceptMultiple} />
          <p><ArrowUpTrayIcon className="w-5 h-5 m-auto" /> Drop file{acceptMultiple ? "s" : ""} here, or click to select.</p>
      </div>
    </div>
  );
}



export const UnstyledDropzone = ({ children, onDrop, accept, acceptMultiple=true, maxFiles=50 }) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
      accept: (accept !== null) ? accept || 'image/*' : undefined,
      onDrop: onDrop,
      maxFiles
    });

                
  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject
  ]);

  return (
    <div {...getRootProps({style})}>
      {children}
      <input {...getInputProps()} multiple={acceptMultiple} />
    </div>
  )
}


export default StyledDropzone;
