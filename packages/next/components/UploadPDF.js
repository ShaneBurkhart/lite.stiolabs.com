import React, { useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { XCircleIcon, PaperClipIcon } from '@heroicons/react/24/outline';

// import { getPresignedUrl, uploadFile } from '../../../util/awsPresign';

import StyledDropzone from './StyledDropzone';

const UploadSheetModalContent = ({ }) => {
	const [files, setFiles] = useState([])
	const [loading, setLoading] = useState(false)
  const [loadingFileTracker, setLoadingFileTracker] = useState({});
  const loadingFileIds = Object.keys(loadingFileTracker).filter(fileId => !loadingFileTracker[fileId].complete);
  const maxFiles = 1000;
  const maxFilesRemaining = maxFiles - (files || []).length;

	const getPresignedUrl = async (filename) => {
		const res = await fetch('/api/presign', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ filename }),
		});
		const data = await res.json();
		return data;
	};

	const uploadFile = async (file, presignedURL, onProgress, onSuccess, onError) => {
		const options = {
			method: 'PUT',
			headers: {
				'Content-Type': "application/pdf",
			},
			body: file,
		};
	
		if (onProgress) {
			options.onUploadProgress = (progressEvent) => {
				const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
				onProgress(percentCompleted);
			};
		}

		try {
			console.log('presignedURL', presignedURL);
			const res = await fetch(presignedURL, options);
			if (res.status === 200) {
				onSuccess();
			} else {
				onError();
			}
		} catch (err) {
			onError();
		}
	};

  const onDrop = (acceptedFiles) => {
    if (loading) return;
    if (!acceptedFiles.length) return;
    if (acceptedFiles.length > maxFilesRemaining) return alert(`Maximum ${maxFiles} files allowed`);

    const dropSessionId = uuidv4();
    
    let toLoad = acceptedFiles.length;
    setLoading(true);
    
    //TODO: error handling - if some doc fails, allow others to continue, loading spinner edge cases etc
    const onPresignError = err => { setLoading(false); console.log('_', err); showErrorToast(`error - ${err}`) };
    const onUploadFileError = err => { setLoading(false); console.log(err); showErrorToast(err) };
    
    (acceptedFiles || []).forEach((file, i) => {
      file.id = `${dropSessionId}-${i}`;
      loadingFileTracker[file.id] = { filename: file.name, progress: 0, complete: false };
      
      const onPresignSuccess = (data) => {
        uploadFile(
          file,
          data.url,
          function onProgress(progress) {
            setLoadingFileTracker(prev => ({ ...prev, [file.id]: { ...prev[file.id], progress } }));
          },
          function uploadSuccess() {
            setLoadingFileTracker(prev => ({ ...prev, [file.id]: { ...prev[file.id], complete: true } }));
            setFiles(prev => [ ...prev, {  id: file.id, filename: file.name, sheetUrl: data.awsURL } ]);
            toLoad -= 1;
            if (!toLoad) {
              setLoading(false);
              setLoadingFileTracker({});
            };
          },
          onUploadFileError
        )
      };

      getPresignedUrl(file).then(onPresignSuccess).catch(onPresignError);
    });
  }
  
  return (
    <>
      <div className="w-full max-w-full px-12 py-8 overflow-y-scroll min-h-48">
        {(!!files.length || !!loadingFileIds.length) && (
          <div className="mb-5 border border-gray-200 divide-y divide-gray-200 rounded">
            {(files || []).map(file => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-blueGray-50">
                <span className="flex items-center">
                  <PaperClipIcon className="w-4 h-4 mr-5 text-gray-500" />
                  <a href={file.sheetUrl} target="_blank" className="ml-2 text-blue-800 hover:text-blue-700">{file.filename}</a>
                </span>
                <XCircleIcon
                  className="w-4 h-4 text-gray-600 cursor-pointer hover:text-blue-600"
                  onClick={() => setFiles(files.filter(f => f.sheetUrl !== file.sheetUrl))}
                />
              </div>
            ))}
            {(loadingFileIds || []).map(fileId => {
              const loadingFile = loadingFileTracker[fileId];
              return (
                <div key={`${fileId}_loading`} className="p-4 bg-blueGray-50">
                  <div className="flex items-center">
                    <PaperClipIcon className="w-4 h-4 mr-5 text-gray-500" />
                    <span className="ml-2 text-gray-500">{loadingFile.filename}</span>
                  </div>
                  <div className="relative px-10 pt-1">
                    <div className="text-xs text-gray-400">Loading {loadingFile.progress}%</div>
                    <div className="flex h-2 mb-4 overflow-hidden text-xs bg-green-200 rounded">
                      <div style={{ width: `${loadingFile.progress}%` }} className="flex flex-col justify-center text-center text-white bg-green-400 shadow-none whitespace-nowrap"></div>
                    </div>
                  </div>
                </div>
            )})}
          </div>
        )}
        <StyledDropzone accept=".pdf" onDrop={onDrop} maxFiles={maxFilesRemaining} />
      </div>
    </>
  )
}

export default UploadSheetModalContent;
