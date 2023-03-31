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
import ExampleModal from '@/components/modals/ExampleModal';


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
    <DataTableColumn width={100}>
      <div className="sticky top-0" >
        <HeaderCell dark value="All Units" />
        <HeaderCell value="Filter units" />
      </div>
      {(units || []).map((unit, j) => (
        <HeaderCell key={j} value={unit.name} />
      ))}
      <HeaderCell dark value="+ Add" onClick={onAdd} />
    </DataTableColumn>
  );

  const leftPercentColumn = (
    <DataTableColumn width={60}>
      <div className="sticky top-0" >
        <ProgressCell dark progress={calculatedData.progress} />
        <HeaderCell dark value="Prog." className="text-left text-sm" />
      </div>
      {(units || []).map((unit, j) => {
        const progress = calculatedData.units[unit.name].completedSqftProgress;
        const isCompleted = calculatedData.units[unit.name].isCompleted;

        return (
          <ProgressCell dark key={j} progress={isCompleted ? 100 : progress} />
        )
      })}

    </DataTableColumn>
  );

  const columns = (accounts|| []).map((account, i) => {
    const accountProgress = calculatedData.accounts[account.name].progress;
    const isAccountCompleted = calculatedData.accounts[account.name].isCompleted;

    return (
      <DataTableColumn key={i} width={150}>
        <div className="sticky top-0" style={{ zIndex: 1 }}>
          <ProgressCell dark progress={isAccountCompleted ? 100 : accountProgress} />
          <HeaderCell value={account.name} />
        </div>
        {/* <HeaderCell value={account.name} onClick={_=>router.push(`/p/${shortcode.name}/${unit.name}`)} /> */}
        {(units|| []).map((unit, j) => {
          const completed = calculatedData.units[unit.name].accounts[account.name].completed;
          const total = calculatedData.units[unit.name].accounts[account.name].total;
          const progress = calculatedData.units[unit.name].accounts[account.name].progress;
          const isCompleted = calculatedData.units[unit.name].accounts[account.name].isCompleted;

          const markCompleted = (account) => {
            markUnitCompleteForAccount(unit.name, account.name);
          }

          const unmarkCompleted = (account) => {
            unmarkUnitCompleteForAccount(unit.name, account.name);
          }

          // toggle mark complete
          const onDoubleClick = e => {
            if (completed === 0 && !isCompleted) {
              markCompleted(account);
            } else {
              unmarkCompleted(account);
            }
          }

          const classNames = [
            total === 0 ? 'bg-gray-200' : '',
          ]

          const barClassNames = [
            (total === 0) ? 'bg-green-400' : '',
          ]

          const textClassName = [
            total === 0 ? 'text-slate-400' : '',
            // isCompleted ? 'text-slate-500' : '',
          ].join(' ')

          return (
            <ProgressCell 
              completable
              onChange={e => onTakeoffChange(unit.name, account.name, e.target.value)}
              data={total || "0"} 
              value={total || "0"} 
              progress={progress || (isCompleted ? 100 : 0)} 
              textClassName={textClassName} 
              barClassName={barClassNames} 
              className={classNames} 
              onDoubleClick={onDoubleClick} 
            />
          )
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
    <>
      <div className=" lg:mx-4 mx-0 flex flex-col max-h-full">
        <SiteHeader projectProgress={calculatedData.progress} projectName={project.name} onProjectNameChange={onChangeProjectName} />

        {/* <div className="my-4 relative">
          <div className="max-w-4xl">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={calculatedData.last30Days} className="">
                <Legend layout="vertical" verticalAlign="top" align="center" />
                <Line type="monotone" dataKey="Total Production" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis orientation="right" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        <div className="my-4 mt-6 flex justify-between">
          <div>
            <a className="text-sm text-green-300 bg-green-900 p-2 px-2 lg:px-4 mr-1 ">Takeoff</a>
            <a className="text-sm text-gray-500 bg-gray-800 p-2 px-2 lg:px-4 mr-1 ">Graphs</a>
            <a className="text-sm text-gray-500 bg-gray-800 p-2 px-2 lg:px-4 mr-1 ">Daily Data</a>
          </div>
          <div>
            <a className="text-sm text-slate-800 bg-yellow-400 p-2 px-2 lg:px-4 ml-2">Upload Takeoff</a>
          </div>
        </div>

        <div className="flex h-full min-h-full overflow-x-auto overflow-y-auto">
          <div className="flex pb-8 h-full"> 
          {/* <div className="flex scale-50 origin-top-left	"> */}
            <div className="flex sticky left-0" style={{ borderRight: '2px solid black', zIndex: 2 }}>
              {leftPercentColumn}
              {leftColumn}
            </div>
            {columns}
            <DataTableColumn width={70}> 
              <div className="sticky top-0" style={{ zIndex: 2 }}>
                <EmptyCell />
                <HeaderCell dark value="+ Add" onClick={onAddAccount} />
              </div>
            </DataTableColumn>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountsDataTable;
