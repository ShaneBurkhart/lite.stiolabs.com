import React, { useRef, useContext, useEffect } from 'react';
import DataTableColumn from './DataTableColumn';
import ScrollContext from './contexts/ScrollContext';
import Cell from './Cell';
import HeaderCell from './HeaderCell';
import TakeoffContext from './contexts/TakeoffContext';

const FloatingHeader = ({ children }) => {
  const { _scrollPosition } = useContext(ScrollContext);
  const _ref = useRef(null);

  useEffect(() => {
    console.log('useEffect');
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


const UnitAttributesDataTable = () => {
  const { scrollPosition } = useContext(ScrollContext);
  const { project, addUnit } = useContext(TakeoffContext)
  const units = project.units;

  const onAdd = () => {
    const unit = prompt('Enter unit name');
    console.log('unit', unit);

    addUnit(unit);
  }


  const columns = (units || []).map((unit, i) => (
    <DataTableColumn key={i}>
      <HeaderCell value={unit.name} />
      <Cell />
    </DataTableColumn>
  ));

  return (
    <div className="my-4">
      <FloatingHeader>Unit Attributes Data</FloatingHeader>
      <div className="flex">
        {columns}
        <DataTableColumn> 
          <HeaderCell value="+" onClick={onAdd} />
        </DataTableColumn>
      </div>
    </div>
  );
};

export default UnitAttributesDataTable;
