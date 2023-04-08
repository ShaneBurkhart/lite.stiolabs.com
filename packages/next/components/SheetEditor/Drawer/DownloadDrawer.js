import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/outline';

import { SheetEditorContext } from '../../../contexts/SheetEditorContext';

import Button from '../../../../shared/components/Button';
import { DrawerWrapper, DrawerHeader } from './DrawerWrapper';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';


export default function DownloadDrawer({ onClose, toggleDrawers }) {
  const { project_access_token }= useParams();

  const {
    allShapes,
    exportPDF,
    pollInfo: {
      snapshot,
      setSnapshot,
      pipelineDidTimeout,
      pipelineDidComplete,
    },
    filters: {
      publishedFilters,
      setPublishedFilters,
    }
  } = useContext(SheetEditorContext);
  const polling = snapshot?.s3Url && !pipelineDidComplete && !pipelineDidTimeout
  
  const downloadLink = snapshot?.s3Url
  const didGenerate = pipelineDidComplete && !!downloadLink
  
  const [_loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const loading = _loading || polling;
  

  const handleGenerate = () => {
    setLoading(true);
    if (error) setError('');

    const onSuccess = () => setLoading(false)
    
    const onError = (msg) => {
      setLoading(false)
      setError(msg || 'File upload was not successful')
    }
    
    exportPDF(onSuccess, onError)
  }

  const _publishedCount = allShapes.filter(s => s.published).length;
  const publishedList = [
    { val: 'published', display: 'Include published markups', count: _publishedCount },
    { val: 'unpublished', display: 'Include personal markups', count: allShapes.length - _publishedCount },
  ]

  const togglePublishedFilter = status => {
    if (!publishedFilters.includes(status)) return setPublishedFilters([ ...publishedFilters, status ]);
    return setPublishedFilters([ ...publishedFilters.filter(s => s !== status) ]);
  }

  const PollingContent = () => (
    <>
      <div className="relative flex items-center justify-center h-48">
        {loading ? <LoadingSpinner noBackgroundColor /> : <CheckCircleIcon className="font-light text-green-500 h-4/6" />}
      </div>
      <div className="text-lg text-center text-gray-800">
        {loading ? 'Your PDF is generating' : 'Your PDF is ready to download'}
      </div>
      {didGenerate && (
        <div className="py-8 space-y-2">
          <a href={`/api/${project_access_token}/exports/download/${snapshot.id}`}>
            <Button
              color="blue"
              size="lg"
              className="justify-center w-full tracking-wider border border-blue-600 disabled:border-blueGray-300 hover:shadow disabled:hover:shadow-none"
              innerText="Download PDF"
              title="download pdf"
            />
          </a>
          <Button
            color="white"
            size="lg"
            className="justify-center w-full tracking-wider border border-gray-400 disabled:border-blueGray-300 hover:shadow disabled:hover:shadow-none"
            innerText="Create another PDF"
            title="create new pdf"
            onClick={() => setSnapshot(null)}
          />
        </div>
      )}
    </>
  );
  

  return (
    <DrawerWrapper>
      <DrawerHeader title="Download" onClose={onClose} />
      <div className="flex flex-col text-sm">
        {(loading || didGenerate) ? (
          <PollingContent />
        ) : (
          <>
            <p className="pt-4">Note: Filters apply to exports. Your export will only have the markups that are currently visible.</p>
            <p className="py-2"><a className="tracking-wide text-blue-600 cursor-pointer hover:text-blue-700" onClick={() => toggleDrawers('filters')}>Adjust Filters</a></p>
            <label className="block py-2 font-medium">Download Options</label>
            {publishedList.map(p => (
              <div key={p.val} className="flex items-center h-6 space-x-2.5 mb-0.5">
                <input
                  id={p.val}
                  type="checkbox"
                  className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-400"
                  checked={!publishedFilters.includes(p.val)}
                  onChange={() => togglePublishedFilter(p.val)}
                />
                <label htmlFor={p.val} className="font-medium text-gray-700">
                  {p.display}
                </label>
                <span className="text-xs text-gray-500">({p.count})</span>
              </div>
            ))}
            <div className="py-8">
              {!!error && <div className="mb-2 font-medium tracking-wide text-red-500">{error}</div>}
              <Button
                color="blue"
                size="lg"
                className="justify-center w-full tracking-wider border border-blue-600 disabled:border-blueGray-300 hover:shadow disabled:hover:shadow-none"
                innerText="Generate"
                title="Generate PDF"
                onClick={handleGenerate}
              />
            </div>
          </>
        )}
      </div>
    </DrawerWrapper>
  )
}