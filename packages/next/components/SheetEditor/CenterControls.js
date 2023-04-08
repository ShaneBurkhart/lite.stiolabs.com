import React, { useState, useContext } from "react";
import { XIcon } from '@heroicons/react/outline';
import svgIcons from "../../svgIcons";
import { CrossIcon } from "@heroicons/react/24/outline";

// import { SheetEditorContext } from "project/contexts/SheetEditorContext";
// import { UndoRedoContext } from "project/contexts/UndoRedoContext";

const { LeftArrowIcon, RightArrowIcon, UndoIcon, RedoIcon } = svgIcons;

// import { SheetEditorContext } from "project/contexts/SheetEditorContext";
import SVGButton from '../SVGButton';

const { PlusIcon, MinusIcon, FitToScreenIcon, ExpandFullScreenIcon, CollapseFullScreenIcon } = svgIcons;

export default function BottomLeftControls({ onClickFit, onClickZoomIn, onClickZoomOut }) {
  // const { filters } = useContext(SheetEditorContext);
  const filters = [];

  const [open, setOpen] = useState(false);

  const [fullScreen, setFullScreen] = useState(false);

  const names = [
    "A1.1 - Floor Plan",
    "A1.2 - Floor Plan",
    "A1.3 - Floor Plan Long Name",
    "S1.1 - Floor Plan With Strucutral Details And Stuff",
  ]
  const currentSheet = names.pop();

  return (
    <>
      <div 
        className="absolute bottom-0 w-full z-20 flex flex-row ring-2 ring-white ring-opacity-10 justify-center items-end"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <SVGButton
          svgIcon={ <UndoIcon height={22} width={22} fill="white" /> }
          className="w-10 border border-gray-500"
        />
        <div className="flex flex-col" style={{ maxWidth: "250px" }}>
          {open && (
            <div 
              className="mb-1 font-bold cursor-pointer ellipsis overflow-hidden whitespace-nowrap text-sm"
            >
              Recent Sheets
            </div>
          )}
          {open && names.map((name, index) => (
            <div className="bg-gray-900 mb-2 border-2 border-gray-700 p-0.5 px-1 hover:bg-blue-900 cursor-pointer ellipsis overflow-hidden whitespace-nowrap text-sm">
              {name}
            </div>
          ))}
          <div 
            className="bg-gray-900 border border-gray-500 p-2 px-2 hover:bg-blue-900 cursor-pointer truncate overflow-hidden whitespace-nowrap text-sm"
            onClick={() => setOpen(!open)}
          >
            {currentSheet}
          </div>
        </div>
        <SVGButton
          svgIcon={ <RedoIcon height={22} width={22} fill="white" /> }
          className="w-10 border border-gray-500"
        />
      </div>
      {!!filters.count && (
        <div className="absolute z-20 flex flex-col ring-2 ring-white top-4 left-20 ring-opacity-10">
          <button
            className="flex items-center h-10 px-3 py-2 mb-px text-sm text-white bg-gray-900 rounded hover:bg-blue-600"
            type="button"
            onClick={filters.resetFilters}
            title="clear filters"
          >
            Clear Filters
            <XIcon className="w-4 h-4 ml-4" />
          </button>
        </div>
      )}
    </>
  );
}
