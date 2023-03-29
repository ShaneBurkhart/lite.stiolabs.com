import React, { useState, useRef, useContext, useEffect } from 'react';
import DataTableColumn from './DataTableColumn';
import ScrollContext from './contexts/ScrollContext';
import Cell from './Cell';
import HeaderCell from './HeaderCell';
import TakeoffContext from './contexts/TakeoffContext';
import { addAccount } from '@/lib/commands';
import ProgressCell from './ProgressCell';
import { useRouter } from 'next/router';
import ProgressBar from './ProgressBar';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SiteHeader from './SiteHeader';
import useCalculatedProjectValues from '@/utils/hooks/useCalculatedProjectValues';
import EmptyCell from './EmptyCell';

const data = [
  { name: 'Day 1', 1001: 400, 1002: 2400, 2003: 2400 },
  { name: 'Day 2', 1001: 300, 1002: 1398, 2003: 2210 },
  { name: 'Day 3', 1001: 200, 1002: 9800, 2003: 2290 },
  { name: 'Day 4', 1001: 278, 1002: 3908, 2003: 2000 },
  { name: 'Day 5', 1001: 189, 1002: 4800, 2003: 2181 },
  { name: 'Day 6', 1001: 239, 1002: 3800, 2003: 2500 },
  { name: 'Day 7', 1001: 349, 1002: 4300, 2003: 2100 },
  { name: 'Day 8', 1001: 478, 1002: 2908, 2003: 2390 },
  { name: 'Day 9', 1001: 439, 1002: 3902, 2003: 2500 },
  { name: 'Day 10', 1001: 470, 1002: 4800, 2003: 2100 },
  { name: 'Day 11', 1001: 580, 1002: 3800, 2003: 2390 },
  { name: 'Day 12', 1001: 539, 1002: 3908, 2003: 2500 },
  { name: 'Day 13', 1001: 500, 1002: 4800, 2003: 2100 },
  { name: 'Day 14', 1001: 609, 1002: 3800, 2003: 2390 },
  { name: 'Day 15', 1001: 678, 1002: 3902, 2003: 2500 },
  { name: 'Day 16', 1001: 600, 1002: 4800, 2003: 2100 },
  { name: 'Day 17', 1001: 709, 1002: 3800, 2003: 2390 },
  { name: 'Day 18', 1001: 778, 1002: 3908, 2003: 2500 },
  { name: 'Day 19', 1001: 700, 1002: 4800, 2003: 2100 },
  { name: 'Day 20', 1001: 809, 1002: 3800, 2003: 2390 }
];


// todo
// - fix calculations
// - add input mode for takeoff data


const AccountsDataTable = ({ leftWidth }) => {
  const router = useRouter();
  const { project, shortcode, changeName, addUnit, addAccount, updateTakeoffData, markUnitCompleteForAccount, unmarkUnitCompleteForAccount } = useContext(TakeoffContext)
  const units = project.units;
  const accounts = project.accounts;
  const [takeoffData, setTakeoffData] = useState(project.takeoffData || {});

  const calculatedData = useCalculatedProjectValues(project);
  console.log('calculatedData', calculatedData);

	const markedCompleted = project.markedCompleted || {};

	const unitsProduction = units.map(unit => {
		const accountsMarkedCompleted = markedCompleted[unit.name] || {};
		const unitTakeoffData = takeoffData[unit.name] || {};
		const unitCount = 1;
		const completedSqft = accounts.reduce((acc, account) => {
			const takeoffData = unitTakeoffData[account.name] || 0;
			const completed = accountsMarkedCompleted[account.name] || 0;
			const accountCompleted = takeoffData * completed
			return acc + accountCompleted;
		}, 0);

		const totalSqft = accounts.reduce((acc, account) => {
			const takeoffData = unitTakeoffData[account.name] || 0;
			const accountTotal = takeoffData * unitCount;
			return acc + accountTotal;
		}, 0);
		const completedSqftProgress = totalSqft === 0 ? 0 : completedSqft / totalSqft * 100;

		return {
			name: unit.name,
			completedSqft,
			totalSqft,
			completedSqftProgress,
		}
	})

	const totalCompletedSqft = unitsProduction.reduce((acc, unit) => acc + unit.completedSqft, 0);
	const totalSqft = unitsProduction.reduce((acc, unit) => acc + unit.totalSqft, 0);
	const totalCompletedSqftProgress = totalSqft === 0 ? 0 : totalCompletedSqft / totalSqft * 100;

  const onChangeProjectName = (name) => {
    changeName(name);
  }

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
      <HeaderCell dark value="All Units" />
      <HeaderCell value="paste takeoff data" />
      {(units || []).map((unit, j) => (
        <HeaderCell key={j} value={unit.name} />
      ))}
      <HeaderCell dark value="+ Add" onClick={onAdd} />
    </DataTableColumn>
  );

  const leftPercentColumn = (
    <DataTableColumn width={150}>
      <ProgressCell dark value={50} />
      <HeaderCell dark value="% Completed" />
      {(units || []).map((unit, j) => {
        const progress = calculatedData.units[unit.name].completedSqftProgress;
        console.log('progress', progress);

        return (
          <ProgressCell dark key={j} progress={progress} />
        )
      })}

    </DataTableColumn>
  );

  const columns = (accounts|| []).map((account, i) => {
    const accountProgress = calculatedData.accounts[account.name].progress;

    return (
      <DataTableColumn key={i} width={175}>
        <ProgressCell dark progress={accountProgress} />
        <HeaderCell value={account.name} />
        {/* <HeaderCell value={account.name} onClick={_=>router.push(`/p/${shortcode.name}/${unit.name}`)} /> */}
        {(units|| []).map((unit, j) => {
          const completed = calculatedData.units[unit.name].accounts[account.name].completed;
          const total = calculatedData.units[unit.name].accounts[account.name].total;
          const progress = calculatedData.units[unit.name].accounts[account.name].progress;

          const markCompleted = (account) => {
            markUnitCompleteForAccount(unit.name, account.name);
          }

          const unmarkCompleted = (account) => {
            unmarkUnitCompleteForAccount(unit.name, account.name);
          }

          // toggle mark complete
          const onClick = _ => {
            if (completed === 0) {
              markCompleted(account);
            } else {
              unmarkCompleted(account);
            }
          }

          const classNames = [
            total === 0 ? 'bg-gray-300' : '',
          ]

          return <ProgressCell value={total || "0"} progress={progress} className={classNames} onClick={onClick} />
          // return (
          //   <Cell 
          //     key={j} 
          //     value={val || ''}
          //     onChange={e => onTakeoffChange(unit.name, account.name, e.target.value)} 
          //   />
          // )
        })}
      </DataTableColumn>
    );
  });

  return (
    <div className="my-3 mx-4 flex flex-col min-h-full">
      <SiteHeader projectProgress={calculatedData.progress} projectName={project.name} onProjectNameChange={onChangeProjectName} />

      <div className="my-8 mx-8">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} className="my-8">
            <Legend layout="vertical" verticalAlign="top" align="right" />
            <Line type="monotone" dataKey="1001" stroke="#8884d8" />
            <Line type="monotone" dataKey="1002" stroke="#8884d8" />
            <Line type="monotone" dataKey="2003" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" interval={6} />
            <YAxis orientation="right" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex overflow-x-auto w-full" >
        <div className="flex pb-8 scale-75 md:scale-100 origin-top-left"> 
        {/* <div className="flex scale-50 origin-top-left	"> */}
          {leftPercentColumn}
          {leftColumn}
          {columns}
          <DataTableColumn> 
            <EmptyCell />
            <HeaderCell dark value="+ Add" onClick={onAddAccount} />
          </DataTableColumn>
        </div>
      </div>
    </div>
  );
};

export default AccountsDataTable;
