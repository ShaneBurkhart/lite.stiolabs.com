import React, { useState, useContext } from "react";
import { XIcon } from '@heroicons/react/outline';
import svgIcons from "../../svgIcons";

// import { SheetEditorContext } from "project/contexts/SheetEditorContext";
import SVGButton from '../SVGButton';

const { PlusIcon, MinusIcon, FitToScreenIcon, ExpandFullScreenIcon, CollapseFullScreenIcon } = svgIcons;

export default function LeftControls({ onClickFit, onClickZoomIn, onClickZoomOut }) {
  // const { filters } = useContext(SheetEditorContext);
  const filters = [];

  const [fullScreen, setFullScreen] = useState(false);

  return (
    <>
      <div className="absolute z-20 flex flex-col ring-2 ring-white top-4 left-4 ring-opacity-10">
        <SVGButton
          title="zoom in"
          svgIcon={<PlusIcon height={24} width={24} fill="white" />} 
          className="w-10 rounded rounded-b-none"
          onClick={onClickZoomIn}
        />
        <SVGButton
          title="fit to page"
          svgIcon={<FitToScreenIcon height={24} width={24} fill="white" />} 
          className="w-10 rounded-none"
          onClick={onClickFit}
        />
        <SVGButton
          title="zoom out"
          svgIcon={<MinusIcon height={24} width={24} fill="white" />} 
          className="w-10 rounded rounded-t-none"
          onClick={onClickZoomOut}
        />

        {/* TODO: implement full screen */}
        {/* {!fullScreen && (
          <SVGButton
            title="full screen"
            svgIcon={<ExpandFullScreenIcon height={24} width={24} fill="white" />} 
            className="w-10 mt-4 rounded"
            />
          )} */}
        {/* {fullScreen && (
          <SVGButton
            title="exit full screen"
            svgIcon={<CollapseFullScreenIcon height={24} width={24} fill="white" />} 
            className="w-10 mt-4 rounded"
          />
        )} */}
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
