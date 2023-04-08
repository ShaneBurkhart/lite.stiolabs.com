import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/outline';

import { SheetEditorContext } from '../../../contexts/SheetEditorContext';

import Button from '../../../../shared/components/Button';
import { DrawerWrapper, DrawerHeader } from './DrawerWrapper';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';

export default function ExportDrawer({ onClose, toggleDrawers }) {
  const { project_access_token }= useParams();
  const {
    // allShapes,
    exportPDF,
    exportImage,
    pollInfo: {
      snapshot,
      setSnapshot,
      pipelineDidTimeout,
      pipelineDidComplete,
    }
  } = useContext(SheetEditorContext);
  
  const polling = snapshot?.s3Url && !pipelineDidComplete && !pipelineDidTimeout
  
  const downloadLink = snapshot?.s3Url
  const didGenerate = pipelineDidComplete && !!downloadLink
  
  const [_loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const loading = _loading || polling;

  const settings = [
    { name: 'Snapshot', description: 'Image of the visible screen' },
    { name: 'Full Sheet', description: 'PDF of the entire sheet' },
  ]
  
  const [selected, setSelected] = useState(settings[0].name)

  const handleGenerate = () => {
    if (!selected) return
    
    setLoading(true);
    if (error) setError('');

    const onSuccess = () => setLoading(false)
    
    const onError = () => {
      setLoading(false)
      setError('File upload was not successful')
    }
    
    if (selected === "Snapshot") exportImage(onSuccess, onError)
    if (selected === "Full Sheet") exportPDF(onSuccess, onError)
  }

  const PollingContent = () => (
    <>
      <div className="relative flex items-center justify-center h-48">
        {loading ? <LoadingSpinner noBackgroundColor /> : <CheckCircleIcon className="font-light text-green-500 h-4/6" />}
      </div>
      <div className="text-lg text-center text-gray-800">
        {loading ? 'Generating snapshot' : 'Your snapshot is ready to download'}
      </div>
      {didGenerate && (
        <div className="py-8 space-y-2">
          <a href={`/api/${project_access_token}/exports/download/${snapshot.id}`}>
            <Button
              color="blue"
              size="lg"
              className="justify-center w-full tracking-wider border border-blue-600 disabled:border-blueGray-300 hover:shadow disabled:hover:shadow-none"
              innerText="Download Snapshot"
              title="download snapshot"
            />
          </a>
          <Button
            color="white"
            size="lg"
            className="justify-center w-full tracking-wider border border-gray-400 disabled:border-blueGray-300 hover:shadow disabled:hover:shadow-none"
            innerText="Create another snapshot"
            title="create new snapshot"
            onClick={() => setSnapshot(null)}
          />
        </div>
      )}
    </>
  );
  

  return (
    <DrawerWrapper>
      <DrawerHeader title="Export" onClose={onClose} />
      {(loading || didGenerate) ? (
        <div className="flex flex-col text-sm">
          <PollingContent />
        </div>
      ) : (
        <div className="flex flex-col text-sm divide-y divide-gray-200">
            <div className="pt-4">
              <RadioGroup value={selected} onChange={setSelected}>
                <RadioGroup.Label className="sr-only">Export settings</RadioGroup.Label>
                <div className="-space-y-px bg-white rounded-md">
                  {settings.map((setting, i) => (
                    <Option key={setting.name} setting={setting} settingIdx={i} settingsLength={settings.length} />
                  ))}
                </div>
              </RadioGroup>
              <div className="py-8">
                {!!error && <div className="mb-2 font-medium tracking-wide text-red-500">{error}</div>}
                <Button
                  color="blue"
                  size="lg"
                  className="justify-center w-full tracking-wider border border-blue-600 disabled:border-blueGray-300 hover:shadow disabled:hover:shadow-none"
                  innerText="Create Snapshot"
                  title="Generate snapshot"
                  onClick={handleGenerate}
                />
                {selected === "Full Sheet" && (
                  <>
                    <p className="pt-4">Note: Filters apply to pdf exports. Your export will only have the markups that are currently visible.</p>
                    <p className="py-2"><a className="tracking-wide text-blue-600 cursor-pointer hover:text-blue-700" onClick={() => toggleDrawers('filters')}>Adjust Filters</a></p>
                  </>
                )}
              </div>
            </div>
        </div>
      )}
    </DrawerWrapper>
  )
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Option = ({ setting, settingIdx, settingsLength }) => (
  <RadioGroup.Option
    key={setting.name}
    value={setting.name}
    className={({ checked }) =>
      classNames(
        settingIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
        settingIdx === settingsLength - 1 ? 'rounded-bl-md rounded-br-md' : '',
        checked ? 'bg-indigo-50 border-indigo-200 z-10' : 'border-gray-200',
        'relative border p-4 flex cursor-pointer focus:outline-none'
      )
    }
  >
    {({ active, checked }) => (
      <>
        <span
          className={classNames(
            checked ? 'bg-indigo-500 border-transparent' : 'bg-white border-gray-300',
            active ? 'ring-2 ring-offset-2 ring-indigo-400' : '',
            'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center'
          )}
          aria-hidden="true"
        >
          <span className="rounded-full bg-white w-1.5 h-1.5" />
        </span>
        <div className="flex flex-col ml-3">
          <RadioGroup.Label
            as="span"
            className={classNames(checked ? 'text-indigo-900' : 'text-gray-900', 'block text-sm font-medium')}
          >
            {setting.name}
          </RadioGroup.Label>
          <RadioGroup.Description
            as="span"
            className={classNames(checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm')}
          >
            {setting.description}
          </RadioGroup.Description>
        </div>
      </>
    )}
  </RadioGroup.Option>
)