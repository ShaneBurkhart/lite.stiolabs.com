import { useState, useContext } from 'react'
import TakeoffContext from './contexts/TakeoffContext';
import ProgressBar from './ProgressBar';
import Image from 'next/image';
import FocusEditable from './FocusEditable';

export default function SiteHeader({ projectName, projectProgress, onProjectNameChange }) {
  return (
      <div className="flex justify-between lg:flex-row flex-col">
        <div className="flex flex-shrink-0 mb-4 lg:mb-0">
          <img src="/stio_logo_white.png" className="flex-none" style={{ height: 28, marginRight: 15 }} />
          {/* <Image src="/stio_logo_white.png" width={50} height={10} style={{ marginLeft: 5, marginRight: 20 }} /> */}
          <h2 className="text-xl">Production Tracking</h2>
        </div>

          <FocusEditable value={projectName} onChange={onProjectNameChange} wrapperClassName="lg:px-12 px-0 w-full lg:text-center max-w-full overflow-hidden" className="mt-0.5 w-full lg:text-center" >
            <h2 className="text-xl mb-0 pb-0 cursor-pointer  text-ellipsis whitespace-nowrap  max-w-full overflow-hidden">
              {projectName}
            </h2>
          </FocusEditable>

          <div className="flex flex-shrink-0 lg:flex-row flex-col" style={{ marginTop: 1 }}>
            <div className="flex mr-2 mb-4 lg:mb-0">
              <span className="mr-2">Progress</span>
              <ProgressBar progress={projectProgress} className="mt-0" style={{ width: 200, marginTop: 1 }} />
            </div>
            <div>
              <a
                href="#"
                className="rounded-md bg-indigo-600 py-1 lg:px-3 px-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Copy
              </a>
              <a
                href="#"
                className="rounded-md bg-indigo-600 ml-1 py-1  lg:px-3 px-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Export
              </a>
              <a
                href="#"
                className="rounded-md bg-indigo-600 ml-1 py-1 lg:px-3 px-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                History
              </a>
              <a
                href="#"
                className="rounded-md bg-indigo-600 ml-1 py-1 lg:px-3 px-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Share
              </a>
              <a
                href="#"
                className="rounded-md bg-indigo-600 ml-1 py-1 lg:px-3 px-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Login
              </a>
            </div>
          </div>

      </div>
  )
}
