import React, { useState, useContext } from 'react';
import { PlusIcon } from '@heroicons/react/outline';
// import { ProjectContext } from 'project/contexts/ProjectContext';
// import { SheetEditorContext } from 'project/contexts/SheetEditorContext';
import { PhotosContext } from 'project/contexts/PhotosContext';
import LoadingSpinner from 'shared/components/LoadingSpinner';

import UploadPhotosModal from '../../PhotosPanel/UploadPhotosModal';
import EditPhotoModal from '../../PhotosPanel/EditPhotoModal';



export default function LinkDrawer({ selectedShape, sendUpdate }) {
  const { allPhotos, createPhotos } = useContext(PhotosContext);

  const [title, _setTitle] = useState(selectedShape?.title || '')
  const [photoIds, _setPhotoIds] = useState(selectedShape?.photoIds || '')
  const [showUploadPhotosModal, setShowUploadPhotosModal] = useState(false)
  const [photoToEdit, setPhotoToEdit] = useState(null);
  const showEditPhotoModal = !!photoToEdit;
  const closeEditPhotoModal = () => setPhotoToEdit(null);



  const toggleUploadPhotosModal = () => setShowUploadPhotosModal(!showUploadPhotosModal)


  const shapePhotos = allPhotos.filter(photo => photoIds.includes(photo.id))

  const setTitle = e => {
    _setTitle(e.target.value)
    selectedShape.title = e.target.value
    sendUpdate() 
  }

  const setPhotoIds = (photoIds=[]) => {
    const nextPhotoIds = [...selectedShape.photoIds, ...photoIds]
    
    _setPhotoIds(nextPhotoIds)
    selectedShape.photoIds = nextPhotoIds;
    sendUpdate() 
  }

  const handleCreatePhotos = (newPhotos) => {
    setPhotoIds(newPhotos.map(p => p.id))
    createPhotos(newPhotos)

    toggleUploadPhotosModal()
  }

  return (
    <>
      <InputField value={title} onChange={setTitle} label="Title"  />
      <div>
        <a
          className="text-blue-600 hover:text-blue-700 cursor-pointer text-base tracking-wide flex items-center"
          onClick={toggleUploadPhotosModal}
        >
           <PlusIcon height={12} className="mr-2" /> Add Photos
        </a>
      </div>
      {!!shapePhotos.length && (
        <div>
          <h3 className="text-base text-gray-700 tracking-wide font-medium">Photos</h3>
          <ul>
            {shapePhotos.map(photoData => (
              <button
                key={photoData.id}
                type="button"
                title="edit photo"
                className={`block w-1/2 overflow-hidden p-1 m-1 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 group focus:outline-none group-hover:opacity-100`}
                onClick={() => setPhotoToEdit(photoData)}
              >
                <div className="w-full rounded-sm group aspect-w-5 aspect-h-5">
                  <Image src={photoData.url} alt={photoData.filename} />
                  <span className="sr-only">View details for {photoData.filename}</span>
                </div>
              </button>
            ))}
          </ul>
        </div>
      )}
      {showUploadPhotosModal && <UploadPhotosModal onClose={toggleUploadPhotosModal} onSubmit={handleCreatePhotos} /> }
      {showEditPhotoModal && <EditPhotoModal onClose={closeEditPhotoModal} photoData={photoToEdit} /> }
    </>
  )
}


const InputField = ({ onChange, value, label, placeholder }) => {
  return (
    <div>
      <label className="block mb-2 text-base font-medium text-gray-600 capitalize" htmlFor={label}>{label}</label>
      <input
        id={label}
        type="text"
        className="block w-full text-sm border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-300"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
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
