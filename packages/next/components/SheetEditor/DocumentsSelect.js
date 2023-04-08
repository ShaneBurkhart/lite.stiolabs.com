import React, { Fragment, useState, useContext } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";

import { DocumentsContext } from '../../contexts/DocumentsContext';

/* These components use a lot of boilerplate from headlessui */


/*
  LINK DRAWER (ANNOTATIONS > HYPERLINK SHAPES)DOCUMENTS SELECT
*/

export const LinkDrawerDocumentsSelect = ({ selectedDocumentId='', onChange }) => {
  const { allDocuments } = useContext(DocumentsContext);
  const selectedDocument = allDocuments.find(doc => doc.id === selectedDocumentId);
  const [selected, setSelected] = useState(selectedDocument)

  const _onChange = (val) => {
    const newDoc = allDocuments.find(doc => doc.id === val);
    setSelected(newDoc);
    onChange(newDoc.id, newDoc.title || newDoc.filename);
  }

  if (!allDocuments.length) return (
    <div className="flex items-center h-full italic text-gray-600 text-sm">
      This project has no uploaded documents
    </div>
  );

  return (
    <div>
      <Listbox value={(selected || {}).title || ''} onChange={_onChange}>
        {({ open }) => (
          <>
            <div className="relative w-full text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-300 bg-white">
              <Listbox.Button className="relative w-full h-10 px-1 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                <div className="flex items-center">
                  <p className="px-4 font-medium text-md">{(selected || {}).title || 'Select a Document'}</p>
                </div>
                <span className="absolute inset-y-0 flex items-center pointer-events-none right-2">
                  {open ? (
                    <ChevronUpIcon
                      className="w-5 h-5"
                      aria-hidden="true"
                    />
                  ):(
                    <ChevronDownIcon
                      className="w-5 h-5"
                      aria-hidden="true"
                    />
                  )}
                </span>
              </Listbox.Button>
              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options
                  static
                  className="absolute z-10 w-full py-1 mt-1 overflow-auto text-xs bg-white rounded-md shadow-lg min-w-24 max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                >
                  {allDocuments.map(doc => (
                    <Option
                      key={doc.id}
                      value={doc.id}
                    >
                      <span>{doc.title}</span>
                    </Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  );
}

export const Option = ({ children, value }) => {
  return (
    <Listbox.Option
      className={({ selected }) =>
        `${
          selected
            ? "text-blueGray-900 bg-blueGray-100"
            : "text-gray-900"
        }
          select-none relative py-2 pl-10 pr-4 hover:bg-indigo-100 cursor-pointer focus:bg-indigo-100`
      }
      value={value}
    >
      {({ selected, active }) => (
        <>
          <span
            className={`${
              selected ? "font-medium" : "font-normal"
            } block truncate`}
          >
            {children}
          </span>
          {selected ? (
            <span
              className={`${
                active ? "text-blueGray-600" : "text-blueGray-600"
              }
                absolute inset-y-0 left-0 flex items-center pl-3`}
            >
              <CheckIcon
                className="w-5 h-5"
                aria-hidden="true"
              />
            </span>
          ) : null}
        </>
      )}
    </Listbox.Option>
  )
}
