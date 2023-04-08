import React, { useContext } from 'react';
import svgIcons from '../../../../assets/svgIcons';
import { annotationHexNums as hexNums, hexNumLookupTable as hexNumLookup } from "gmi-annotation-tool/dist/canvas-react/config/colors";
import { shapeClasses, shapeClassMap, groups } from "gmi-annotation-tool/dist/canvas-react/config/shapes";

import { SheetEditorContext } from '../../../contexts/SheetEditorContext';

import { DrawerWrapper, DrawerHeader } from './DrawerWrapper';


export default function FiltersDrawer({ onClose }){
  const {
    allShapes,
    filters: {
      count,
      totalCount,
      _currentShapes,
      _currentColors,
      colorFilters,
      shapeFilters,
      publishedFilters,
      resetFilters,
      setColorFilters,
      setShapeFilters,
      setPublishedFilters,
    }
  } = useContext(SheetEditorContext);
  
  const counts = {};
  _currentColors.forEach(c => {
    if (!counts[c]) counts[c] = 0;
    counts[c] += 1;
  })
  const colorList = hexNums.filter(h => _currentColors.includes(h)).map(h => ({ ...hexNumLookup[h], count: counts[h] }));
  
  _currentShapes.forEach(s => {
    if (!counts[s]) counts[s] = 0;
    counts[s] += 1;
  })
  const shapeList = shapeClasses.filter(c => _currentShapes.includes(c)).map(c => ({ ...shapeClassMap[c], count: counts[c] }));

  const setAllFilters = () => {
    setPublishedFilters(["published", "unpublished"]);
    setColorFilters(hexNums.filter(h => _currentColors.includes(h)));
    setShapeFilters(shapeClasses.filter(c => _currentShapes.includes(c)));
  }

  const _publishedCount = allShapes.filter(s => s.published).length;
  const publishedList = [ //TODO: icons (?)
    { val: 'published', display: 'Published to project', count: _publishedCount },
    { val: 'unpublished', display: 'Personal markups', count: allShapes.length - _publishedCount },
  ]

  const toggleColorFilter = hexNum => {
    if (!colorFilters.includes(hexNum)) return setColorFilters([ ...colorFilters, hexNum ]);
    return setColorFilters([ ...colorFilters.filter(h => h !== hexNum ) ]);
  }

  const toggleShapeFilter = shapeClass => {
    if (!shapeFilters.includes(shapeClass)) return setShapeFilters([ ...shapeFilters, shapeClass ]);
    return setShapeFilters([ ...shapeFilters.filter(s => s !== shapeClass) ]);
  }

  const togglePublishedFilter = status => {
    if (!publishedFilters.includes(status)) return setPublishedFilters([ ...publishedFilters, status ]);
    return setPublishedFilters([ ...publishedFilters.filter(s => s !== status) ]);
  }

  const groupedShapes = Object.fromEntries(groups.map(g => [g, shapeList.filter(s => s.group === g)]));
  const { general, measurement, hyperlink, basic } = groupedShapes;

  const groupCounts = {};
  _currentShapes.forEach(s => {
    const shape = shapeClassMap[s];
    if (!shape) return console.log(`cannot find shape class ${s}`);
    if (!groupCounts[shape.group]) groupCounts[shape.group] = 0;
    groupCounts[shape.group] += 1;
  })

  const toggleGroupFilter = group => {
    const groupClasses = groupedShapes[group].map(s => s._class);
    const allChecked = !groupClasses.some(c => shapeFilters.includes(c));
    
    if (allChecked) return setShapeFilters([ ...shapeFilters, ...groupClasses.filter(c => !shapeFilters.includes(c)) ]);
    return setShapeFilters([ ...shapeFilters.filter(c => !groupClasses.includes(c)) ])
  }

  const MarkupCheckbox = ({ shape }) => {
    const Icon = svgIcons[shape.icon];
    return (
      <div key={shape.key} className="flex items-center h-6 space-x-2.5">
        <input
          id={shape.key}
          type="checkbox"
          className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-400"
          checked={!shapeFilters.includes(shape._class)}
          onChange={() => toggleShapeFilter(shape._class)}
        />
        <div className="flex items-center w-5 h-5 border-black">
          <Icon stroke="gray" fill="gray" />
        </div>
        <label htmlFor={shape.key} className="font-medium text-gray-700 capitalize">
          {shape.display}
        </label>
        <span className="text-xs text-gray-500">({shape.count})</span>
      </div>
    )
  }

  const GroupCheckbox = ({ group, iconName, label }) => {
    const Icon = svgIcons[iconName];
    const groupCount = groupCounts[group];
    return (
      <div key={group} className="flex items-center h-6 space-x-2.5">
        <input
          id={group}
          type="checkbox"
          className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-400"
          checked={!groupedShapes[group].some(s => shapeFilters.includes(s._class))}
          onChange={() => toggleGroupFilter(group)}
        />
        <div className="flex items-center w-5 h-5 border-black">
          <Icon stroke="gray" fill="gray" />
        </div>
        <label htmlFor={group} className="font-medium text-gray-700 capitalize">
          {label}
        </label>
        <span className="text-xs text-gray-500">({groupCount})</span>
      </div>
    )
  }

  return (
    <DrawerWrapper>
      <DrawerHeader title="Filters" onClose={onClose}>
      {!!count ? (
        <a className="mr-2 text-sm font-medium tracking-wide text-gray-600 cursor-pointer hover:text-blue-800" onClick={resetFilters}>Reset</a>
        ) : (
        <span className="mr-2 text-sm tracking-wide text-gray-400 cursor-default">Reset</span>
      )}
      </DrawerHeader>
      <div className="flex flex-col mb-2 space-y-4 text-sm divide-y divide-gray-200">
        <div className="pt-2">
          <div className="mr-2 text-right">
            {count < totalCount ? (
              <a className="text-blue-700 cursor-pointer hover:text-blue-800" onClick={setAllFilters}>Hide All</a>
            ) : (
                <a className="text-blue-700 cursor-pointer hover:text-blue-800" onClick={resetFilters}>Show All</a>
            )}
          </div>
          <fieldset>
            <legend className="block my-2">Share Status</legend>
            <div className="space-y-2">
              {publishedList.map(p => {
                return (
                  <div key={p.val} className="flex items-center h-6 space-x-2.5">
                    <input
                      id={p.val}
                      type="checkbox"
                      className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-400"
                      checked={!publishedFilters.includes(p.val)}
                      onChange={() => togglePublishedFilter(p.val)}
                    />
                    {/* <div className="flex items-center w-5 h-5 border-black">
                      <Icon stroke="gray" fill="gray" />
                    </div> */}
                    <label htmlFor={p.val} className="font-medium text-gray-700 capitalize">
                      {p.display}
                    </label>
                    <span className="text-xs text-gray-500">({p.count})</span>
                  </div>
                );
              })}
            </div>
          </fieldset>
        </div>
        <div className="pt-2">
          <fieldset>
            <legend className="block my-2">Markups</legend>
            <div className="space-y-2">
              {general.map(shape => (
                <MarkupCheckbox key={shape.key} shape={shape} />
              ))}
              {!!hyperlink?.length && (
                <GroupCheckbox group="hyperlink" label="hyperlink" iconName="LinkIcon" />
              )}
              {!!basic?.length && (
                <>
                  <GroupCheckbox group="basic" label="All Shapes" iconName="BasicShapesIcon" /> 
                  <div className="ml-7">
                    {basic.map(shape => (
                      <MarkupCheckbox key={shape.key} shape={shape} />
                    ))}
                  </div>
                </>
              )}
              {!!measurement?.length && (
                <>
                  <GroupCheckbox group="measurement" label="All Measurements" iconName="CalibrationIcon" />
                  <div className="ml-7">
                    {measurement.map(shape => (
                      <MarkupCheckbox key={shape.key} shape={shape} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </fieldset>
        </div>
        <div className="pt-2">
          <fieldset>
            <legend className="block my-2">Colors</legend>
            <div className="space-y-2">
              {colorList.map(hex => (
                <div key={hex.string} className="flex items-center h-5 space-x-2.5">
                  <input
                    id={hex.name}
                    type="checkbox"
                    className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-400"
                    checked={!colorFilters.includes(hex.num)}
                    onChange={() => toggleColorFilter(hex.num)}
                  />
                  <div className="w-5 h-5 border border-black rounded-full" style={{ backgroundColor: hex.string }} />
                  <label htmlFor={hex.name} className="font-medium text-gray-700 capitalize">
                    {hex.name}
                  </label>
                  <span className="text-xs text-gray-500">({hex.count})</span>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </DrawerWrapper>
  )
}
