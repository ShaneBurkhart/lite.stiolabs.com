import React, { useState, useRef, useContext, useEffect } from 'react';
import DataTableColumn from './DataTableColumn';
import ScrollContext from './contexts/ScrollContext';
import Cell from './Cell';
import HeaderCell from './HeaderCell';
import TakeoffContext from './contexts/TakeoffContext';

const FloatingHeader = ({ children }) => {
  const { _scrollPosition } = useContext(ScrollContext);
  const _ref = useRef(null);

  useEffect(() => {
    // const interval = setInterval(() => {
    //   console.log('_scrollPosition', _scrollPosition.current);
    //   if (_ref.current) {
    //     const marginLeft = Number(_ref.current.marginLeft?.replace('px', ''));
    //     const diff = Math.min(_scrollPosition.current - marginLeft, 10);
    //     console.log('diff', diff, _scrollPosition.current, _ref.current.offsetLeft);
    //     // _ref.current.style.marginLeft = `${_scrollPosition.current + diff}px`;
    //   }
    // }, 1000/60)

    // return () => clearInterval(interval);
  }, []);

  return (
    <h2 ref={_ref} className="text-xl font-bold mb-2 w-full">{children}</h2>
  )
}


const UnitAttributesDataTable = ({ leftWidth }) => {
  const { scrollPosition } = useContext(ScrollContext);
  const { project, addUnit, updateUnitInfo } = useContext(TakeoffContext)
  const units = project.units;
  const [unitsInfo, setUnitsInfo] = useState(project.unitsInfo || {});

  const onAdd = () => {
    const unit = prompt('Enter unit name');

    addUnit(unit);
  }

  const onUnitCountChange = (unit, value) => {
    const num = Number(value);
    if (isNaN(num)) return;

    const unitInfo = unitsInfo[unit] || {};
    const newUnitInfo = {
      ...unitInfo,
      count: num,
    };

    setUnitsInfo({ ...unitsInfo, [unit]: newUnitInfo });
    updateUnitInfo(unit, newUnitInfo);
  }

  const columns = (units || []).map((unit, i) => {
    const unitInfo = unitsInfo[unit.name] || {};
    const unitCount = unitInfo.count || 0;

    return (
      <DataTableColumn key={i}>
        <HeaderCell value={unit.name} />
        <Cell 
          value={unitCount || ''} 
          onChange={e => onUnitCountChange(unit.name, e.target.value)} 
        />
      </DataTableColumn>
    )
  });

  return (
    <div className="my-4">
      <FloatingHeader>Unit Attributes Data</FloatingHeader>
      <div className="flex">
        <DataTableColumn width={leftWidth}> 
          <HeaderCell value="Attributes" />
          <Cell 
            value="Unit Count"
          />
        </DataTableColumn>
        {columns}
        <DataTableColumn> 
          <HeaderCell value="+ Add" onClick={onAdd} />
        </DataTableColumn>
      </div>
    </div>
  );
};

export default UnitAttributesDataTable;
