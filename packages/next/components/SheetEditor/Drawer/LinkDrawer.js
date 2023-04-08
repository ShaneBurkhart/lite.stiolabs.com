import React, { useState, useContext, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { PlusIcon, PaperClipIcon, DocumentTextIcon, XIcon } from '@heroicons/react/outline';

import { LinkDrawerSheetSelect } from '../SheetSelect';
import { LinkDrawerDocumentsSelect } from '../DocumentsSelect';

import { ProjectContext } from 'project/contexts/ProjectContext';
import { DocumentsContext } from 'project/contexts/DocumentsContext';
import { SheetEditorContext } from 'project/contexts/SheetEditorContext';

import UploadDocumentsModal from '../../DocumentsPanel/UploadDocumentsModal';


const linkTypes = [
  'sheet',
  'document',
  // 'rfi',
];

export default function LinkDrawer({ selectedShape, sendUpdate }) {
  const history = useHistory();
  const { getTopMostSheets } = useContext(ProjectContext);
  const { allDocuments, createDocuments } = useContext(DocumentsContext);
  const { setSheet } = useContext(SheetEditorContext);
  

  const [linkRef, _setLinkRef] = useState(selectedShape?.linkRef || '')
  const [linkType, _setLinkType] = useState(selectedShape?.linkType || 'sheet')
  const [label, _setLabel] = useState(selectedShape?.label || '')
  const [note, _setNote] = useState(selectedShape?.note || '')
  const [showBorder, _setShowBorder] = useState(selectedShape?.showBorder || false)

  const [showUploadDocumentsModal, setShowUploadDocumentsModal] = useState(false)
  const toggleUploadDocumentsModal = () => setShowUploadDocumentsModal(!showUploadDocumentsModal)

  const setLinkRef = (val, _display) => {
    let display = _display || val;
    _setLinkRef(val)
    _setLabel(display)
    selectedShape.linkRef = val
    selectedShape.label = display
    sendUpdate() 
  }

  const setLinkType = type => {
    _setLinkType(type)
    _setLinkRef('');
    _setLabel('');
    selectedShape.linkType = type
    selectedShape.linkRef = ''
    selectedShape.label = ''
    sendUpdate() 
  }

  const setLabel = e => {
    _setLabel(e.target.value)
    selectedShape.label = e.target.value
    sendUpdate() 
  }
  
  const setNote = e => {
    _setNote(e.target.value)
    selectedShape.note = e.target.value
    sendUpdate() 
  }
  
  const setShowBorder = bool => {
    _setShowBorder(bool)
    selectedShape.showBorder = bool
    sendUpdate() 
  }

  const handleCreateDocument = (newDocuments=[]) => {
    createDocuments(newDocuments)
    setLinkRef((newDocuments[0] || {}).id)

    toggleUploadDocumentsModal()
  }

  let linkedSheet = null;
  if (!!linkRef && linkType === 'sheet') {
    linkedSheet = getTopMostSheets().find(s => s.num === linkRef)
  }

  let linkedDocument = null;
  if (!!linkRef && linkType === 'document') {
    linkedDocument = allDocuments.find(d => d.id === linkRef)
  }

  return (
    <>
      <RadioGroup onChange={setLinkType} linkType={linkType} />
      <div>
        {!!linkedSheet && (
          <>
          <div className="mt-4 flex items-center justify-center">
            <a
              className='cursor-pointer group inline-flex p-1 bg-blueGray-100 hover:bg-blue-100 rounded-sm'
              onClick={() => setSheet(linkedSheet)}
            >
              <img src={linkedSheet.thumbnailUrl} className="h-32 mx-auto border border-gray-100 shadow group-hover:border-blue-200 group-hover:opacity-90" />
            </a>
          </div>
          <div className="mt-4 py-1 px-2 flex items-center">
            <a
              className="text-blue-600 hover:text-blue-700 cursor-pointer text-base tracking-wide flex items-center space-between w-full"
              onClick={() => setSheet(linkedSheet)}
            >
              <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-500 group-hover:text-gray-600" />
              {linkedSheet.num}
            </a>
            <button
              title="delete document link"
              className="flex items-center justify-center overflow-hidden focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 group focus:outline-none border border-gray-50 hover:border-gray-200 rounded hover:shadow-sm hover:bg-blueGray-50"
              onClick={() => setLinkRef('')}
            >
              <XIcon className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
            </button>
          </div>
          </>
        )}
        {!!linkedDocument && (
          <div className="mb-4 flex items-center">
            <a
              className="text-blue-600 hover:text-blue-700 cursor-pointer text-base tracking-wide flex items-center space-between w-full"
              onClick={() => history.push(`../../documents`)} //TODO: document viewer after document viewer is created
              target="_blank"
            >
              <PaperClipIcon className="h-4 w-4 mr-2 text-gray-500 group-hover:text-gray-600" />
              {linkedDocument.title || linkedDocument.filename}
            </a>
            <button
              title="delete document link"
              className="flex items-center justify-center overflow-hidden focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 group focus:outline-none border border-gray-50 hover:border-gray-200 rounded hover:shadow-sm hover:bg-blueGray-50"
              onClick={() => setLinkRef('')}
            >
              <XIcon className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
            </button>
          </div>
        )}
        {(linkType === "sheet" && !linkedSheet) &&  <SheetSelect selectedSheetNum={linkRef} onChange={setLinkRef} label="Link" placeholder="Choose link..."  />}
        {(linkType === "document" && !linkedDocument) && (
          <>
            <LinkDrawerDocumentsSelect selectedDocumentId={linkRef} onChange={setLinkRef} label="Link" placeholder="Choose link..."  />
            <a
              className="text-blue-600 hover:text-blue-700 cursor-pointer text-base tracking-wide flex items-center mt-2"
              onClick={toggleUploadDocumentsModal}
            >
              <PlusIcon height={12} className="mr-2" /> Add Document
            </a>
          </>
        )}
      </div>
      <InputField value={label} onChange={setLabel} label="Label" placeholder="Description"  />
      <div className="flex items-center">
        <input
          id="borders"
          type="checkbox"
          className="w-5 h-5 text-indigo-500 border-gray-300 rounded cursor-pointer focus:ring-indigo-400"
          checked={showBorder}
          onChange={() => setShowBorder(!showBorder)}
        />
        <label htmlFor="borders" className="ml-2 text-base font-medium text-gray-700 capitalize">
          Show markup borders
        </label>
      </div>
      <InputField value={note} onChange={setNote} label="Note" placeholder=""  />
      <UploadDocumentsModal
        key={showUploadDocumentsModal ? 'upload-doc-modal' : 'upload-doc-modal-hidden'}
        acceptMultiple={false}
        show={showUploadDocumentsModal}
        onClose={toggleUploadDocumentsModal}
        onSubmit={handleCreateDocument}
      />
    </>
  )
}

const RadioGroup = ({ onChange, linkType }) => {
  return (
    <fieldset>
      <legend className="text-base font-medium text-gray-600">Link Type</legend>
      <div className="mt-2 space-y-1">
        {linkTypes.map(t => (
          <div key={t} className="flex items-center">
            <input
              id={t}
              type="radio"
              checked={linkType === t}
              onChange={() => onChange(t)}
              className="w-4 h-4 text-sm text-indigo-400 border-gray-300 focus:ring-indigo-400"
            />
            <label htmlFor={t} className="ml-3">
              <span className="block text-base font-medium text-gray-500 capitalize">{t}</span>
            </label>
          </div>
        ))}
      </div>
    </fieldset>
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

const SheetSelect = ({ onChange, selectedSheetNum }) => {
  return (
    <>
      <label className="block mb-2 text-base font-medium text-gray-600 capitalize" htmlFor="sheet">Sheet</label>
      <LinkDrawerSheetSelect selectedSheetNum={selectedSheetNum} onSelect={onChange} />
    </>
  )
}

