// FixedButton.js
import { ArrowLeftIcon, ClockIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, FolderIcon } from '@heroicons/react/24/outline';
import React from 'react';

      // {/* <input 
      //   type="text" 
      //   className="z-20 flex flex-col ring-2 bg-white p-1 px-4 ring-white ring-opacity-10 border-2 border-gray-300"
      //   placeholder="Search"
      // /> */}

const FixedButton = (props) => {
  const [clockOpen, setClockOpen] = React.useState(false);

  const names = [
    "A1.1 - Floor Plan",
    "A1.2 - Floor Plan",
    "A1.3 - Floor Plan Long Name",
    "S1.1 - Floor Plan With Strucutral Details And Stuff",
  ]

  if (true) {
    return (
      <div
        className="fixed top-0 left-0 flex flex-col z-10"
      >
        <button
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
          style={{ zIndex: 1000 }}
          // onClick={() => console.log('Button clicked')}
          {...props}
        >
          <ChevronDoubleRightIcon />
        </button>
        {/* <div className="flex flex-row">
          <button
            className="p-2 bg-green-500 hover:bg-green-600 text-white mr-2 w-12 h-12 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
            style={{ zIndex: 1000 }}
            onClick={() => setClockOpen(!clockOpen)}
          >
            <ClockIcon  />
          </button>
          {/* {clockOpen && (
            <div className="flex flex-col" style={{ maxWidth: "250px" }}>
              {names.map((name, index) => (
                <div 
                  className="bg-gray-900 mt-2 border-2 border-gray-500 p-0.5 px-1 hover:bg-blue-900 cursor-pointer ellipsis overflow-hidden whitespace-nowrap text-sm"
                >
                  {name}
                </div>
              ))}
            </div>
          )} */}
        {/* </div> */} 
      </div>
    );
  }

  return (
    <button
      className="fixed top-0 left-0 p-2 bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
      onClick={() => console.log('Button clicked')}
    >
      <FolderIcon className="w-6 h-6" />
    </button>
  );
};

export default FixedButton;
