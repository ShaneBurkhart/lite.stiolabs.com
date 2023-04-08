import React, { useContext, useState, useRef } from 'react';
import { drawerShapes } from "gmi-annotation-tool/dist/canvas-react/config/shapes";
import _ from 'underscore';
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/solid";

import { ProjectContext } from 'project/contexts/ProjectContext';

import TextEditDrawer from './TextEditDrawer';
import CalibrationDrawer from './CalibrationDrawer';
import LinkDrawer from './LinkDrawer';
import CameraDrawer from './CameraDrawer';
import TaskDrawer from './TaskDrawer';
import { DrawerWrapper, DrawerHeader } from './DrawerWrapper';
import LoadingSpinner from 'shared/components/LoadingSpinner';

const SUCCESS = 'success';
const ERROR = 'error';

export default function ShapeDrawer({
  sheet={},
  title='',
  onClose,
  updateAnnotations,
  selectedShape,
  selectedShapes,
  ...otherShapeProps
}){
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const updateStatus = newStatus => {
    setStatus(newStatus);
    setLoading(false);
  }
  
  const __sendUpdate = useRef(_.debounce(() => {
    const onSuccess = () => updateStatus(SUCCESS);
    const onError = () => updateStatus(ERROR);

    updateAnnotations(selectedShapes, onSuccess, onError)
  }, 180)).current

  const _sendUpdate = () => {
    setLoading(true);
    __sendUpdate();
  }

  if (!selectedShape || !drawerShapes[selectedShape.constructorName]){
    return (
      <DrawerWrapper>
        <DrawerHeader title={title} onClose={onClose} />
        <div className="p-4 tracking-wide text-gray-600">
          <span className="capitalize">{title}</span> markup is not selected.
        </div>
      </DrawerWrapper>
    )
  }

  const drawerProps = { setLoading, selectedShape, sendUpdate: _sendUpdate }
  
  return (
    <DrawerWrapper>
      <DrawerHeader title={title} onClose={onClose}>
        <LoadingStatus loading={loading} status={status} />
      </DrawerHeader>

      <div className="flex flex-col text-sm divide-y divide-gray-200">
        <ShapeSubheader published={selectedShape.published} setLoading={setLoading} setStatus={setStatus} loading={loading} {...otherShapeProps} />
        <div className="py-8 space-y-8">
          {!title && <PlaceholderDrawer />}
          {title === 'calibration' && <CalibrationDrawer {...drawerProps} />}
          {title === 'text' && <TextEditDrawer {...drawerProps} />}
          {title === 'link' && <LinkDrawer {...drawerProps} />}
          {title === 'camera' && <CameraDrawer {...drawerProps} />}
          {title === 'task' && (
            <TaskDrawer
              hideSheetSelect
              selectedTaskId={selectedShape.taskId}
              setLoading={setLoading}
              setStatus={setStatus}
              sheetId={sheet.id}
              stampId={selectedShape.stampId}
            />
          )}
        </div>
        <ShapeUserSection shapeId={selectedShape.id} />
      </div>
    </DrawerWrapper>
  )
}

const PlaceholderDrawer = () => (
  <div className="flex flex-col divide-y divide-gray-200">
    <div className="w-full h-8 px-1 py-4 sm:flex-row" />
    <div className="w-full py-8 space-y-8 h-72" />
  </div>
)

export const ShapeSubheader = ({ published, unpublishSelectedAnnotation, publishSelectedAnnotation, deleteSelectedAnnotation, setLoading, setStatus, loading }) => {
  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    setLoading(false);
  }
  
  const onSuccess = () => updateStatus(SUCCESS);
  const onError = () => updateStatus(ERROR);

  return (
    <div className="flex flex-col justify-between w-full px-1 py-4 font-medium tracking-wide sm:flex-row">
      <button
        disabled={loading}
        className="font-medium text-blue-500 cursor-pointer max-w-max hover:text-blue-600 disabled:hover:text-blue-400 disabled:text-blue-400 disabled:cursor-auto"
        onClick={() => {
          setLoading(true)
          published ? unpublishSelectedAnnotation(onSuccess, onError) : publishSelectedAnnotation(onSuccess, onError)
        }}
      >
        {published ? 'Unpublish' : 'Publish to project'}
      </button>
      <button
        className="mt-2 font-medium text-red-500 cursor-pointer max-w-max hover:text-red-600 sm:mt-0"
        onClick={deleteSelectedAnnotation}
      >
        Delete
      </button>
    </div>
  )
}

export const ShapeUserSection = ({ shapeId }) => {
  const { annotations, project } = useContext(ProjectContext)
  
  const annotation = (annotations || []).find(a => a.id === shapeId)
  
  if (!annotation) { // most likely indicates it is a just-created shape, TODO: test and render
    console.warn(`Annotation id ${shapeId} not found`)
    return ""
  }

  const user = (project.users || []).find(u => u.id === annotation.userId)

  if (!user) {
    console.warn(`User id ${annotation.userId} not found`)
    return ""
  }
  
  // TODO: annotation date?, make sure this works when users are wired up
  return (
    <div className="w-full px-1 pt-12 tracking-wide">
      <p className="text-gray-600">Created by {user.firstName} {user.lastName}</p>
      <p className="text-gray-500">{user.email}</p>
    </div>
  )
}

const LoadingStatus = ({ loading, status }) => (
  <div className={`${loading ? 'opacity-50': 'opacity-100'} transition-opacity duration-300`}>
    {loading &&  (
      <div className="relative h-full w-7 mr-7">
        <LoadingSpinner />
      </div>
    )}
    {!loading && !!status && (
      <div className="flex items-center h-full">
        {status === SUCCESS ? <CheckCircleIcon className="w-6 h-6 text-green-500" /> : <XCircleIcon className="w-6 h-6 text-red-500" />}
        <span className="ml-2 text-xs text-gray-600 sm:ml-3 sm:text-sm sm:mr-1">
          {status === SUCCESS ? 'Saved' : 'Could not save'}
        </span>
      </div>
    )}
  </div>
)

