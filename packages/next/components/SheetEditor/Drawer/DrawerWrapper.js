import React, { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/solid';

export const DrawerWrapper = ({ children }) => (
  <div className="relative flex-1 px-4 py-4 sm:px-6">
    {children}
  </div>
);

export const DrawerHeader = ({ onClose=null, title='', children }) => (
  <div className="flex items-center justify-between pb-2 mb-1 border-b border-gray-200 bg-blueGray-50">
    <div className="flex items-center text-gray-700">
      <button
        type="button"
        className="mr-4 text-gray-400 rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-50"
        onClick={() => onClose()}
      >
        <span className="sr-only">Close panel</span>
        <XIcon className="w-5 h-5" aria-hidden="true" />
      </button>
      <h3 className="p-0 text-lg font-medium tracking-wide capitalize">{title}</h3>
    </div>
    {children}
  </div>
);

export const DrawerTransition = React.memo(({ show, children }) => {
  return (
    <Transition.Root show={show} as={Fragment}>
      <div className="absolute z-10 overflow-hidden">
        <div className="fixed bottom-0 right-0 flex max-w-full pl-2">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-linear duration-200 sm:duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-linear duration-200 sm:duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <div className="flex flex-col h-full overflow-y-scroll border-l border-gray-200 shadow-xl max-w-1/2-screen sm:w-96 bg-gray-50 side-drawer__wrapper--sheet-editor">
              {children}
            </div>
          </Transition.Child>
        </div>
      </div>
    </Transition.Root>
  )
})

