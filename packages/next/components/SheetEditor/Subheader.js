import React, { useContext } from "react";
import svgIcons from "../../svgIcons";
import { SearchIcon } from '@heroicons/react/outline'

// import { SheetEditorContext } from "project/contexts/SheetEditorContext";
// import { ProjectContext } from 'project/contexts/ProjectContext';

import { HeaderSheetSelect } from './SheetSelect';

const { SquareIcon, SquareIconDashed, DownloadIcon, ExportIcon, FilterIcon, InfoOutlineIcon } = svgIcons;

const GroupButton = ({ children, className='', active=false, onClick }) => (
  <button onClick={onClick} className={`px-3 py-2 hover:text-blue-800 text-sm ${active ? 'bg-blue-100' : 'hover:bg-blue-50'} ${className}`}>
    {children}
  </button>
);


export default function Subheader({ drawer, toggleDrawers }) {
  const { sheet, setSheet, filters } = useContext(SheetEditorContext);
  const { project } = useContext(ProjectContext);
  if (!sheet) return '';

  const printSheetPhotos = () => {
    window.open("/api/sheets/" + project.id + "/" + sheet.id + "/print", '_blank') 
  }

  return (
    <section
      className="flex justify-between flex-none h-16 px-4 bg-white border-b-2 shadow-2xl z-25"
      style={{
        boxShadow: "0 2px 4px 0 rgb(31 49 61 / 10%), 0 0 0 1px rgb(31 49 61 / 5%)",
      }}
    >
      <div className="flex flex-col justify-center">
        <span className="text-sm font-medium text-gray-400">Sheet</span>
        <HeaderSheetSelect
          className="z-30 min-w-24"
          sheetChange={setSheet}
          sheet={sheet}
        />
      </div>

      <div className="flex items-center">
        <div className="flex overflow-hidden text-blue-700 bg-white border border-gray-200 divide-y divide-gray-200 rounded-lg shadow-sm md:divide-y-0 md:divide-x">
          {/* TODO: implement overlay */}
          {/* <GroupButton className="relative">
            <SquareIcon className="inline mr-1 relative -top-0.5" />
            <SquareIconDashed className="absolute inline mr-1 top-3 left-5" />
          </GroupButton> */}
          <GroupButton
            className="flex items-center"
            onClick={() => printSheetPhotos()}
          >
            <DownloadIcon className="inline mr-2" />
            Photos
          </GroupButton>
          <GroupButton
            className="flex items-center"
            active={drawer === 'download'}
            onClick={() => toggleDrawers('download')}
          >
            <DownloadIcon className="inline mr-2" />
            Download
          </GroupButton>
          <GroupButton
            className="flex items-center"
            active={drawer === 'export'}
            onClick={() => toggleDrawers('export')}
          >
            <ExportIcon className="inline mr-2" />
            Export
          </GroupButton>
          <GroupButton
            className="flex items-center"
            active={drawer === 'filters'}
            onClick={() => toggleDrawers('filters')}
          >
            <FilterIcon className="inline mr-2" />
            Filter {!!filters.count && <span className="ml-1 text-xs tracking-wide text-blue-600">({filters.totalCount - filters.count})</span> }
          </GroupButton>
          <GroupButton
            active={drawer === 'sheetInfo'}
            onClick={() => toggleDrawers('sheetInfo')} 
            className="flex items-center"
          >
            <InfoOutlineIcon className="inline mr-2" />
            Sheet Info
          </GroupButton>
          <GroupButton
            active={drawer === 'search'}
            onClick={() => toggleDrawers('search')} 
            className="flex items-center"
          >
            <SearchIcon className="w-5 h-5 mr-2" color="#2b6cb0" /> 
            Search
          </GroupButton>
        </div>
      </div>
    </section> 
  );
}
