import React, { Fragment, useState, useEffect, useContext, useMemo } from "react";
import { Listbox, Transition } from "@headlessui/react";
// import { objSortDesc, dateObjSortDesc } from 'gmi-utils';
// import { disciplinePrefixes } from '../../../constants/sheetDisciplineDesignators';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";

// import { ProjectContext } from '../../contexts/ProjectContext';

/* These components use a lot of boilerplate from headlessui */

/*
  SUBHEADER SHEET SELECT
*/
export const HeaderSheetSelect = ({ sheet, setSheet, className='w-full' }) => {
  const [selected, setSelected] = useState(sheet)

  const { project } = useContext(ProjectContext)
  const sheets = project.Sheets || [];
  const versionSets = project.VersionSets || [];
  const vs = Object.fromEntries(versionSets.map(v => [v.id, v]));

  const sheetHistory = sheets.filter(s => s.num === selected.num);

  const onChange = (value) => {
    setSelected(value)
    setSheet(value)
  }

  return (
    <div className={className}>
      <Listbox value={selected || {}} onChange={onChange}>
        {({ open }) => (
          <>
            <div className="relative mt-1">
              <Listbox.Button className="relative w-full pl-1 pr-10 text-left bg-white rounded cursor-default focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                <span className={`block truncate text-blue-600 text-lg`}>
                  <span className="font-medium">{selected?.num} {selected?.name ? `- ${selected.name} - ` : ''} ({vs[selected?.VersionSetId]?.name}) </span>
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  {open ? (
                    <ChevronUpIcon
                      className="w-5 h-5 text-gray-400"
                      aria-hidden="true"
                    />
                  ):(
                    <ChevronDownIcon
                      className="w-5 h-5 text-gray-400"
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
                  className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg min-w-72 max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                >
                  {sheetHistory.map(s => (
                    <Option
                      key={s.id}
                      value={s}
                    >
                      <div>
                        <span className="font-medium">{s.num} </span>
                        {s.name && <span className="text-gray-600">- {s.name} - </span>}
                        <span className="text-gray-500">({vs[s.VersionSetId]?.name})</span>
                      </div>
                      <div className="text-xs text-gray-500">Issued: {vs[s.VersionSetId]?.formattedIssuanceDate}</div>
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

const useTopMostSheetSelect = () => {
  const { project } = useContext(ProjectContext)

  const { topmostSheets, orderedNums } = useMemo(() => {
    let versionSets = project.VersionSets || [];
    const disciplines = project.SheetDisciplines || [];

    versionSets = [...versionSets].sort(dateObjSortDesc('issuanceDate'));

    // get unique sheet nums by most recent version set
    const topmostSheets = {};
    const uniqueNums = [];
    
    versionSets.forEach(v => {
      (v.Sheets || []).forEach(s => {
        if (!uniqueNums.includes(s.num)) {
          topmostSheets[s.num] = s;
          uniqueNums.push(s.num);
        }
      });
    })

    // we want to loop thru the longest prefixes & match longer string patterns first
    const disciplinesOrderedByPrefixDesc = [...disciplines].sort(objSortDesc('prefix'));
    const suggestedPrefixesDesc = disciplinePrefixes.reverse();
  
    // const currentDisciplinesMap = {};
    let remainingNums = [...uniqueNums].sort(); //default alphabetical
    let orderedNums = [];
  
    disciplinesOrderedByPrefixDesc.forEach(d => {
      const disciplinePrefix = d.prefix.toUpperCase();
      const _orderedNums = remainingNums.filter(num => {
        const sheetNum = num.toUpperCase();
        
        if (sheetNum.startsWith(disciplinePrefix)){
          let betterMatchExists = false;
          suggestedPrefixesDesc.forEach(suggestedPrefix => {
            if (sheetNum.startsWith(suggestedPrefix) && (suggestedPrefix.length > disciplinePrefix.length)) {
              betterMatchExists = true;
            }
          });
          return !betterMatchExists;
        }
        
        return false;
      });
      
      remainingNums = remainingNums.filter(s => !_orderedNums.includes(s));
      orderedNums = [...orderedNums, ..._orderedNums];
    });
  
    orderedNums = [...orderedNums, ...remainingNums];

    return {topmostSheets, orderedNums}
  }, [project.VersionSets, project.SheetDisciplines]);

  return { topmostSheets, orderedNums }
}


/*
  BOTTOM CONTROLS SHEET SELECT
*/

export const BottomControlsSheetSelect = ({ sheet, sheetChange }) => {
  if (!sheet) { console.warn('no sheet'); return "";}

  const [selected, setSelected] = useState(sheet)

  const { topmostSheets, orderedNums } = useTopMostSheetSelect();
  

  const onChange = (val) => {
    if (!val || !topmostSheets[val]) return
    setSelected(val)
    sheetChange(topmostSheets[val])
  }

  return (
    <div>
      <Listbox value={(selected || {}).num || ''} onChange={onChange}>
        {({ open }) => (
          <>
            <div className="relative flex items-center h-full text-gray-300 bg-gray-900 rounded ring-2 ring-white hover:bg-blue-600 ring-opacity-10" style={{ width: 210 }}>
              <Listbox.Button className="relative w-full h-10 px-1 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                <div className="relative flex items-center border border-transparent shadow-sm rounded-l-md">
                  <p className="px-4 font-medium text-md">Jump to Sheet</p>
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
                  className="absolute bottom-0 z-10 w-full py-1 overflow-auto text-base bg-white divide-y divide-gray-200 rounded-md shadow-lg mb-14 min-w-12 max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                >
                  {orderedNums.map(num => (
                    <Option
                      key={num}
                      value={num}
                    >
                      <span>{num}</span>
                      {!!topmostSheets[num]?.name && (
                        <span className="ml-2 space-x-2">
                          <span> - </span>
                          <span>{topmostSheets[num].name}</span>
                        </span>
                      )}
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


/*
  LINK DRAWER (ANNOTATIONS > HYPERLINK SHAPES) SHEET SELECT
*/

export const LinkDrawerSheetSelect = ({ selectedSheetNum, onSelect }) => {

  const [selected, setSelected] = useState(selectedSheetNum)

  const { topmostSheets, orderedNums } = useTopMostSheetSelect();
  

  const onChange = (val) => {
    setSelected(val)
    onSelect(val)
  }

  return (
    <div>
      <Listbox value={selected || ''} onChange={onChange}>
        {({ open }) => (
          <>
            <div className="relative w-full text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-300 bg-white">
              <Listbox.Button className="relative w-full h-10 px-1 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                <div className="flex items-center">
                  <p className="px-4 font-medium text-md">{selected || 'Select a Sheet'}</p>
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
                  {orderedNums.map(num => (
                    <Option
                      key={num}
                      value={num}
                    >
                      <span>{num}</span>
                      {!!topmostSheets[num]?.name && (
                        <span className="ml-2 space-x-2">
                          <span> - </span>
                          <span>{topmostSheets[num].name}</span>
                        </span>
                      )}
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

/*
  TASK DRAWER (SHEET EDITOR & TASK PANEL) SHEET SELECT
*/

export const TaskDrawerSheetSelect = ({ selected, onChange }) => {
  const { project } = useContext(ProjectContext)
  const { topmostSheets, orderedNums } = useTopMostSheetSelect();
  
  const sheets = project.Sheets || [];
  const selectedSheet = sheets.find(s => s.id === selected);

  const _onChange = (val) => {
    const _sheet = topmostSheets[val]
    onChange(_sheet.id)
  }

  return (
    <div>
      <Listbox value={selected || ''} onChange={_onChange}>
        {({ open }) => (
          <>
            <div className="relative w-full text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-300 bg-white">
              <Listbox.Button className="relative w-full h-10 px-1 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                <div className="flex items-center">
                  <p className="px-4 font-medium text-md">{selectedSheet ? selectedSheet.num : 'Select a Sheet'}</p>
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
                  {orderedNums.map(num => (
                    <Option
                      key={num}
                      value={num}
                    >
                      <span>{num}</span>
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
