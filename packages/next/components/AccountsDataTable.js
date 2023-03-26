import React, { useRef, useContext, useEffect } from 'react';
import DataTableColumn from './DataTableColumn';
import ScrollContext from './contexts/ScrollContext';
import Cell from './Cell';
import HeaderCell from './HeaderCell';
import TakeoffContext from './contexts/TakeoffContext';

const AccountsDataTable = () => {
  const { scrollPosition } = useContext(ScrollContext);
  const { project, addUnit } = useContext(TakeoffContext)
  const units = project.units;
  const accounts = project.accounts;

  const onAdd = () => {
    const unit = prompt('Enter unit name');
    console.log('unit', unit);

    addUnit(unit);
  }


  const columns = (units || []).map((unit, i) => (
    <DataTableColumn key={i}>
      <HeaderCell value={unit.name} />
      {(accounts || []).map((account, j) => (
        <Cell key={j} />
      ))}
    </DataTableColumn>
  ));

  return (
    <div className="my-4">
      <h2 className="text-xl font-bold mb-2">Accounts Data</h2>
      <div className="flex">
        {columns}
        <DataTableColumn> 
          <HeaderCell value="+" onClick={onAdd} />
        </DataTableColumn>
      </div>
    </div>
  );
};

export default AccountsDataTable;
