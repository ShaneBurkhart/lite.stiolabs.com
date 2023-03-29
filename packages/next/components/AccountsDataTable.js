import React, { useState, useRef, useContext, useEffect } from 'react';
import DataTableColumn from './DataTableColumn';
import ScrollContext from './contexts/ScrollContext';
import Cell from './Cell';
import HeaderCell from './HeaderCell';
import TakeoffContext from './contexts/TakeoffContext';
import { addAccount } from '@/lib/commands';

const AccountsDataTable = ({ leftWidth }) => {
  const { project, addUnit, addAccount, updateTakeoffData } = useContext(TakeoffContext)
  const units = project.units;
  const accounts = project.accounts;
  const [takeoffData, setTakeoffData] = useState(project.takeoffData || {});

  const onAdd = () => {
    const unit = prompt('Enter unit name');
    addUnit(unit);
  }

  const onAddAccount = () => {
    const account = prompt('Enter account name');
    addAccount(account)
  }

  const onTakeoffChange = (unit, account, value) => {
    const num = Number(value);
    if (isNaN(num)) return;

    const unitTakeoffData = takeoffData[unit] || {};

    setTakeoffData({ ...takeoffData, [unit]: { ...unitTakeoffData, [account]: num } });
    updateTakeoffData(unit, account, num);
  }

  const leftColumn = (
    <DataTableColumn width={leftWidth}>
      <HeaderCell value="Accounts" />
      {(accounts || []).map((account, j) => (
        <Cell key={j} value={account.name} />
      ))}
      <HeaderCell value="+ Add" onClick={onAddAccount} />
    </DataTableColumn>
  );

  const columns = (units || []).map((unit, i) => (
    <DataTableColumn key={i}>
      <HeaderCell value={unit.name} />
      {(accounts || []).map((account, j) => {
        const val = takeoffData[unit.name] && takeoffData[unit.name][account.name];
        return (
          <Cell 
            key={j} 
            value={val || ''}
            onChange={e => onTakeoffChange(unit.name, account.name, e.target.value)} 
          />
        )
      })}
    </DataTableColumn>
  ));

  return (
    <div className="my-4">
      <h2 className="text-xl font-bold mb-2">Accounts Data</h2>
      <div className="flex">
        {leftColumn}
        {columns}
        <DataTableColumn> 
          <HeaderCell value="+ Add" onClick={onAdd} />
        </DataTableColumn>
      </div>
    </div>
  );
};

export default AccountsDataTable;
