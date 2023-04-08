// FileDrawer.js
import { UsersIcon, FolderIcon, PhotoIcon, UserGroupIcon, PlayCircleIcon, PlusIcon, Cog6ToothIcon, ChevronDoubleLeftIcon } from '@heroicons/react/24/outline';
import { DocumentIcon, CheckCircleIcon, TableCellsIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';
import { PresentationChartLineIcon, GlobeAmericasIcon, HomeModernIcon, ChatBubbleLeftEllipsisIcon, LockClosedIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import React from 'react';
import FixedButton from './FixedButton';

const SUBMENUS = false;

const FileDrawer = () => {
  const [open, setOpen] = React.useState(false);

  const files = [
    { id: 1, name: 'File 1' },
    { id: 2, name: 'File 2' },
    { id: 3, name: 'File 3' },
  ];

  if (!open) return (
    <FixedButton onClick={_=>setOpen(true)} />
  )

  return (
    <div 
      className="fixed top-0 left-0 bg-gray-100 h-full p-1 w-80 h-auto shadow flex-shrink-0 overflow-y-auto overflow-x-hidden"
      style={{ zIndex: 1000 }}
    >
      <div className="flex justify-between">
        <div className="text-left w-full">
          <button
            className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white w-11 h-11 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
            style={{ zIndex: 1000 }}
            onClick={() => setOpen(false)}
          >
            <ChevronDoubleLeftIcon className="w-8 h-8" />
          </button>
        </div>
        <div className="text-right w-full">
          <button
            className="p-1.5 bg-gray-500 hover:bg-gray-600 text-white w-11 h-11 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
            onClick={() => console.log('Button clicked')}
          >
            <Cog6ToothIcon className="w-8 h-8" />
          </button>
          <button
            className="p-1.5 bg-green-500 hover:bg-green-600 text-white w-11 h-11 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
            onClick={() => console.log('Button clicked')}
          >
            <PlusIcon className="w-8 h-8" />
          </button>
        </div>
      </div>

			<h2 className="text-lg text-black font-bold mb-0 w-full text-left mt-12 mb-0 mx-1">HEB Pjplano - 123 S. First St.</h2> 
			<input className="w-full border border-gray-300 p-1 bg-white" placeholder="Search" />
			<hr className="my-1 mt-0" />
			<div className="flex mb-1">
				<h2 className="text-sm text-black w-full text-center border-r-2 border-gray-300 cursor-pointer">Recent</h2>
				<h2 className="text-sm text-black font-bold w-full text-center cursor-pointer">All</h2>
			</div>
			<ul className="bg-white pt-2 px-1 border-t-2 border-gray-300 min-h-full">
        <li className="flex items-center mb-2">
          <HomeModernIcon className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-gray-700">Home</span>
        </li>
        <li className="flex items-center mb-2">
          <UsersIcon className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-gray-700">Users</span>
        </li>
        {/* <li className="flex items-center mb-2">
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-gray-700">AI Assistant</span>
        </li> */}
        {/* <li className="flex items-center mb-2">
          <HomeModernIcon className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-gray-700">Project Home</span>
        </li> */}
        {/* <li className="flex items-center mb-2">
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-gray-700 font-bold">Announcements (1)</span>
        </li> */}
        {/* <li className="flex items-center mb-2">
          <UsersIcon className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-gray-700">Officers</span>
        </li> */}

        <li className="flex items-center mb-2">
          <Square3Stack3DIcon className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-gray-700">Apps</span>
        </li>
        {/* <li className="flex items-center mb-2 ml-4">
          <LockClosedIcon className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-gray-700">Private (Yours)</span>
        </li>
        <li className="flex items-center mb-2 ml-8">
          <PresentationChartLineIcon className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-gray-700">Presentation - 1/15</span>
        </li>
        <li className="flex items-center mb-2 ml-8">
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-gray-700">Project Managers</span>
        </li> */}
        {/* <li className="flex items-center mb-2 ml-4">
          <FolderIcon className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-gray-700">Building 1</span>
        </li>
        <li className="flex items-center mb-2 ml-8">
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-gray-700 font-bold">Chat (2)</span>
        </li>
        <li className="flex items-center mb-2 ml-8">
          <CalculatorIcon className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-gray-700">Materials & Stocking (79%)</span>
        </li> */}
        {/* <li className="flex items-center mb-2 ml-4">
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-gray-700 font-bold">All Chat (2)</span>
        </li> */}
        <li className="flex items-center mb-2 ml-4">
          <CalculatorIcon className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-gray-700">Materials & Stocking (79%)</span>
        </li>
        <li className="flex items-center mb-2 ml-4">
          <TableCellsIcon className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-gray-700">Framing Production (23%)</span>
        </li>
        <li className="flex items-center mb-2 ml-4">
          <TableCellsIcon className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-gray-700">Drywall Production (0%)</span>
        </li>
        <li className="flex items-center mb-2 ml-4">
          <TableCellsIcon className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-gray-700">Equipment (0%)</span>
        </li>
        <li className="flex items-center mb-2 ml-4">
          <CalculatorIcon className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-gray-700">Time Tracking</span>
        </li>
        <li className="flex items-center mb-2 ml-4">
          <CheckCircleIcon className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-gray-700 font-bold">Daily Safety Checklist</span>
        </li>

        <li className="flex items-center my-2 pt-2">
          <FolderIcon className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-gray-700">Sheets</span>
        </li>
        {/* <li className="flex items-center mb-2">
          <FolderIcon className="w-6 h-6 text-blue-500 mr-2 ml-4" />
          <span className="text-gray-700">Building 1</span>
        </li> */}
				{(SUBMENUS ? [1, 2, 3] : []).map((file) => (
					<>
						{(file === 100) ? (
							<>
								<li className="flex items-center mb-1 ml-8">
									<span className="text-gray-700"><span className="font-bold">A1.{file}</span> - Floor {file}</span>
								</li>
								<li className="flex items-center mb-1 ml-10">
									<span className="text-gray-800 text-sm hover:underline">Jan 24, 2023</span>
								</li>
								<li className="flex items-center mb-1 ml-10">
									<span className="text-gray-400 text-sm hover:underline">Dec 2, 2022</span>
								</li>
								<li className="flex items-center mb-2 ml-10">
									<span className="text-gray-400 text-sm hover:underline">Nov 15, 2022</span>
								</li>
							</>
						) : (
							<li className="flex items-center mb-2 ml-4">
								<span className="text-gray-700"><span className="font-bold">A1.{file}</span> - Floor {file}</span>
							</li>
						)}
					</>
				))}
        <li className="flex items-center mb-2 pt-2">
          <FolderIcon className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-gray-700">Documents</span>
        </li>
        {SUBMENUS && (
          <>
            <li className="flex items-center mb-2">
              <FolderIcon className="w-6 h-6 text-blue-500 mr-2 ml-4" />
              <span className="text-gray-700">Sub Folder</span>
            </li>
            {[1, 2, 3].map((file) => (
              <li className="flex items-center mb-2 ml-8">
                <DocumentIcon className="w-6 h-6 text-blue-500 mr-2" />
                <span className="text-gray-700">Sub Document {file}</span>
              </li>
            ))}
            {[1, 2, 3].map((file) => (
              <li className="flex items-center mb-2 ml-4">
                <DocumentIcon className="w-6 h-6 text-blue-500 mr-2" />
                <span className="text-gray-700">Document {file}</span>
              </li>
            ))}
          </>
        )}
        <li className="flex items-center mb-2 pt-2">
          <PhotoIcon className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-gray-700">Photos</span>
        </li>
        {SUBMENUS && (
          <>
            <li className="flex items-center mb-2 ml-4">
              <PhotoIcon className="w-6 h-6 text-blue-500 mr-2" />
              <span className="text-gray-700">All Photos (1010)</span>
            </li>
            <li className="flex items-center mb-2 ml-4">
              <PhotoIcon className="w-6 h-6 text-blue-500 mr-2" />
              <span className="text-gray-700">Stocking (124)</span>
            </li>
          </>
        )}
        {/* <li className="flex items-center mb-2 pt-2">
          <PhotoIcon className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-gray-700">Users</span>
        </li>
        <li className="flex items-center mb-2 ml-4">
          <PhotoIcon className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-gray-700">All Users (27)</span>
        </li>
        <li className="flex items-center mb-2 ml-4">
          <PhotoIcon className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-gray-700">Stocking (4)</span>
        </li>
        <li className="flex items-center mb-2 ml-4">
          <PhotoIcon className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-gray-700">Framing (10)</span>
        </li>
        <li className="flex items-center mb-2 ml-4">
          <PhotoIcon className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-gray-700">Drywall (13)</span> */}
        {/* </li> */}
      </ul>
    </div>
  );
};

export default FileDrawer;
