import React, { useState, useContext, useRef } from 'react';
import _ from 'underscore';
import { PlusIcon, CalendarIcon, TrashIcon } from '@heroicons/react/outline';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import { ProjectContext } from 'project/contexts/ProjectContext';
import { SheetEditorContext } from 'project/contexts/SheetEditorContext';
import { PhotosContext } from 'project/contexts/PhotosContext';
import { TasksContext } from 'project/contexts/TasksContext';
import LoadingSpinner from 'shared/components/LoadingSpinner';

import UploadPhotosModal from '../../PhotosPanel/UploadPhotosModal';
import EditPhotoModal from '../../PhotosPanel/EditPhotoModal';
import { TaskStatusSelect, TaskTypeSelect, StampSelect, ListSelect, UsersSelect } from '../../TasksPanel/TaskDrawerSelects';
import { TaskDrawerSheetSelect } from '../SheetSelect';


export default function TaskDrawer({ hideSheetSelect, selectedTaskId='', sheetId, stampKey, setLoading=null, setStatus=null }) {
  if (!selectedTaskId) return null;
  
  const { allPhotos, createPhotos } = useContext(PhotosContext);
  const { allTasks, updateTask } = useContext(TasksContext);
  const { allStamps } = useContext(ProjectContext);
  const { updateAnnotationFromTask } = useContext(SheetEditorContext);
  
  let selectedTask = allTasks.find(task => task.id === selectedTaskId);
  
  if (!selectedTask) {
    const { key='', title='' } = allStamps.find(s => (s.key || '').toLowerCase() === (stampKey || '').toLowerCase()) || {};

    selectedTask = {
      id: selectedTaskId,
      sheetId,
      stamp: { key, title },
      title,
    }
  }

  const handleDidUpdate = newStatus => {
    if (setLoading) setLoading(false);
    if (setStatus) setStatus(newStatus);
  }

  const _sendTaskUpdate = useRef(_.debounce((_task) => {
    const onSuccess = () => handleDidUpdate('success');
    const onError = () => handleDidUpdate('error');
  
    updateTask({..._task}, onSuccess, onError)
  }, 180)).current;

  const sendTaskUpdate = (_task) => {
    setLoading(true);
    _sendTaskUpdate(_task);
  }

  const [task, setTask] = useState({...selectedTask || {}})
  
  const [showUploadPhotosModal, setShowUploadPhotosModal] = useState(false)
  const [photoToEdit, setPhotoToEdit] = useState(null);
  const showEditPhotoModal = !!photoToEdit;
  const closeEditPhotoModal = () => setPhotoToEdit(null);

  const handleSetTask = (newVal) => {
    setTask({...task, ...newVal})
    sendTaskUpdate({...task, ...newVal}) 
  }

  const handleCreatePhotos = (newPhotos) => {
    createPhotos(newPhotos)
    const newPhotoIds = newPhotos.map(p => p.id)
    handleSetTask({ photoIds: [...(task.photoIds || []), ...newPhotoIds] })

    setShowUploadPhotosModal(false)
  }
  
  const taskPhotos = allPhotos.filter(photo => { return (task.photoIds || []).includes(photo.id)})

  return (
    <>
      <div>
        <Label label="Title" />
        <InputField
          value={task.title || ''}
          onChange={e => handleSetTask({ title: e.target.value })}
        />
      </div>
      <div>
        <Label label='Status' />
        <TaskStatusSelect
          selected={task.status}
          onChange={newVal => handleSetTask({ status: newVal })}
        />
      </div>
      <div>
        <Label label='Type' />
        <TaskTypeSelect
          selected={task.type}
          onChange={newVal => handleSetTask({ type: newVal })}
        />
      </div>
      <div>
        <Label label='Assigned to' />
        <UsersSelect
          value={task.assignedTo || []}
          onChange={newVals => handleSetTask({ assignedTo: [ ...newVals ] })}
        />
      </div>
      <div>
        <Label label='Watching' />
        <UsersSelect
          value={task.watching || []}
          onChange={newVals => handleSetTask({ watching: [ ...newVals ] })}
        />
      </div>
      <DateInputField
        value={task.startDate}
        onChange={newVal => handleSetTask({ startDate: newVal })}
        label="Start Date"
        htmlFor="startDate"
      />
      <DateInputField
        value={task.endDate}
        onChange={newVal => handleSetTask({ endDate: newVal })}
        label="End Date"
        htmlFor="endDate"
      />
      <div>
        <Label label="Description" />
        <InputField
          value={task.description || ''}
          onChange={e => handleSetTask({ description: e.target.value })}
        />
      </div>
  
      {/* Photos Section */}
      
      <div>
        <Label label="Photos" />
        <a
          className="text-blue-600 hover:text-blue-700 cursor-pointer text-base tracking-wide flex items-center"
          onClick={() => setShowUploadPhotosModal(true)}
        >
           <PlusIcon height={12} className="mr-2" /> Add Photos
        </a>
        {!!taskPhotos.length && (
          <div className="flex flex-wrap mt-2">
            {taskPhotos.map(photo => (
              <div key={photo.id} className="w-1/3 flex p-1 space-x-2">
                <button
                  type="button"
                  title="edit photo"
                  className={`block w-full overflow-hidden focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 group focus:outline-none group-hover:opacity-100`}
                  onClick={() => setPhotoToEdit(photo)}
                >
                  <div className="w-full rounded-sm group aspect-w-5 aspect-h-5">
                    <Image src={photo.url} alt={photo.filename} />
                    <span className="sr-only">View details for {photo.filename}</span>
                  </div>
                </button>
                <TrashIcon
                  className="cursor-pointer text-gray-400 hover:text-gray-600 h-4 w-4 self-end -mr-1"
                  onClick={() => {
                    const newPhotoIds = task.photoIds.filter(id => id !== photo.id)
                    handleSetTask({ photoIds: newPhotoIds })
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label label='Stamp' />
        <StampSelect
          selected={task.stamp?.key}
          onChange={newStamp => {
            updateAnnotationFromTask({ taskId: task.id, stampKey: newStamp.key })
            handleSetTask({ stamp: {key: newStamp.key || '', title: newStamp.title || '' } })
          }}
        />
      </div>
      <div>
        <Label label='List' />
        <ListSelect
          selected={task.listId}
          allListAttributes={task.listAttributes}
          onChange={(newListId, attrs) => {
            handleSetTask({ 
              listId: newListId, 
              listAttributes: { 
                ...(task.listAttributes || {}),
                [newListId]: { 
                  ...((task.listAttributes || {})[newListId] || {}), 
                  ...(attrs || {}) 
                } 
              } 
            })
          }}
        />
      </div>
      {!hideSheetSelect && (
        <div>
          <Label label='Sheet' />
          <TaskDrawerSheetSelect
            selected={task.sheetId}
            onChange={newVal => handleSetTask({ sheetId: newVal })}
          />
        </div>
      )}
      {showUploadPhotosModal && <UploadPhotosModal onClose={() => setShowUploadPhotosModal(false)} onSubmit={handleCreatePhotos} /> }
      {showEditPhotoModal && <EditPhotoModal onClose={closeEditPhotoModal} photoData={photoToEdit} /> }
    </>
  )
}

const Label = ({ label, htmlFor='' }) => {
  return (
    <label className="block mb-2 -mt-1 text-sm font-medium text-gray-600 capitalize" htmlFor={htmlFor}>{label}</label>
  )
}


const CustomDateInput = React.forwardRef(
  ({ value, onClick }, ref) => {
    const isPlaceholder = !value;
    
    return (
      <div
        onClick={onClick} 
        ref={ref}
        className={`${isPlaceholder ? 'text-gray-500' : ''} flex items-center w-full min-w-full p-2 my-1 text-sm leading-6 bg-white border border-gray-300 rounded focus-within:ring-blue-600 focus-within:ring-1 focus:border-blue-600 focus-within:ring-offset-blue-600`}
        tabIndex={0}
      >
        <CalendarIcon className="w-4 h-4 mr-4" />
        <span>{value ? value : 'Select date'}</span>
      </div>
  )},
);

const DateInputField = ({ htmlFor="", label, value, onChange }) => {
  return (
    <div>
      <Label htmlFor={htmlFor} label={label} />
      <div id="datepicker_block" className="w-8/12">
        <DatePicker
          selected={value ? new Date(value) : null}
          onChange={(date) => onChange(date)}
          customInput={<CustomDateInput />}
          popperPlacement="bottom-end" 
        />
      </div>
    </div>
  )
}


const InputField = ({ onChange, value, label, placeholder }) => {
  return (
    <input
      type="text"
      className="block w-full text-sm border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-300"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  )
}

const Image = ({ src, alt="" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <>
      <img src={src} alt={alt} onLoad={() => setIsLoaded(true)} className={`object-cover pointer-events-none group-hover:opacity-80 ${isLoaded ? '' : 'hidden'}`} />
      {!isLoaded && <div className={`w-full h-full bg-gray-100 flex items-center justify-center opacity-75`}><LoadingSpinner small /></div>}
    </>
  )
}
