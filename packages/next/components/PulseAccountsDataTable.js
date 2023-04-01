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
  const { project, shortcode, changeName, addUnit, updateUnit, addAccount, updateAccount, updateTakeoffData, markUnitCompleteForAccount, unmarkUnitCompleteForAccount } = useContext(TakeoffContext)
  const units = project.units;
  const accounts = project.accounts;
  const [takeoffData, setTakeoffData] = useState(project.takeoffData || {});
  const [focusedCell, setFocusedCell] = useState(null);

  const calculatedData = useCalculatedProjectValues(project);

  useEffect(() => {
    setTakeoffData(project.takeoffData || {});
  }, [project])

  const onChangeProjectName = (name) => {
    changeName(name);
  }

  const onAdd = () => {
    addUnit("");
  }

  const onAddAccount = () => {
    addAccount("")
  }

  const onTakeoffChange = (unit, account, value) => {
    const num = Number(value);
    if (isNaN(num)) return;

    const unitTakeoffData = takeoffData[unit] || {};

    setTakeoffData({ ...takeoffData, [unit]: { ...unitTakeoffData, [account]: num } });
    updateTakeoffData(unit, account, num);
  }

  const onTab = (modifiers, j, i) => {
    if (modifiers.shift) {
      setFocusedCell({ rowIndex: j, colIndex: i-1 });
    } else {
      setFocusedCell({ rowIndex: j, colIndex: i+1 });
    }
  }

  const onEnter = (modifiers, j, i) => {
    if (modifiers.shift) {
      setFocusedCell({ rowIndex: j-1, colIndex: i });
    } else {
      setFocusedCell({ rowIndex: j+1, colIndex: i });
    }
  }


  const onPaste = (e, rowOffset, colOffset) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text');
    const rows = data.split('\n').map((row) => row.split('\t'));

    const newUnitIds = {};
    const newAccountIds = {};

    rows.forEach((cols, _j) => {
      const rowIndex = rowOffset + _j;

      cols.forEach((val, _i) => {
        const colIndex = colOffset + _i;
        const account = colIndex >= 0 ? accounts[colIndex] : null;
        const accountId = account?.id || newAccountIds[colIndex];
        const unit = rowIndex >= 0 ? units[rowIndex] : null;
        const unitId = unit?.id || newUnitIds[rowIndex];

        if (rowIndex >= 0 && colIndex >= 0) {
          // DATA CELL
          let v = Number(val) || 0;
          onTakeoffChange(unitId, accountId, v);
        } else if (rowIndex < 0 && colIndex < 0) {
          // PASTE CELL
        } else if (unit && colIndex < 0) {
          // UPDATE UNIT HEADER
          updateUnit(unit.id, { name: val });
        } else if (account && rowIndex < 0) {
          // UPDATE ACCOUNT HEADER
          updateAccount(account.id, { name: val });
        } else if (colIndex < 0 && rowIndex >= 0 && !unit) {
          // NEW UNIT
          const unitId = addUnit(val);
          newUnitIds[rowIndex] = unitId;
        } else if (colIndex >= 0 && rowIndex < 0 && !account) {
          // NEW ACCOUNT
          const accountId = addAccount(val);
          newAccountIds[colIndex] = accountId;
        }
      });
    });

  };

  const leftColumn = (
    <DataTableColumn width={100}>
      <div className="sticky top-0" >
        <HeaderCell dark noEdit value="All Units" />
        <div className="tour-third-step" >
          <HeaderCell 
            value="" 
            data="" 
            placeholder="PASTE" 
            className="text-gray-400"

            onClick={() => {
              if (!navigator.clipboard) {
                alert("No clipboard support");
                return;
              }

              navigator.clipboard.readText().then(text => {
                onPaste({ preventDefault: () => {}, clipboardData: { getData: () => text } }, -1, -1);
              },
              () => {
                alert("No text in clipboard");
              });
            }}
            isFocused={focusedCell?.rowIndex === -1 && focusedCell?.colIndex === -1} 
            onFocus={() => setFocusedCell({ rowIndex: -1, colIndex: -1 })}
            onBlur={() => setFocusedCell(null)}
            onTab={modifiers=>onTab(modifiers, -1, -1)}
            onEnter={modifiers=>onEnter(modifiers, -1, -1)}
            onEscape={() => setFocusedCell(null)}
            onPaste={e=>onPaste(e, -1, -1)} 
          />
        </div>
      </div>
      <div className="tour-second-step" >
        {(units || []).map((unit, j) => (
          <HeaderCell 
            key={j} 
            value={unit.name} 

            isFocused={focusedCell?.rowIndex === j && focusedCell?.colIndex === -1} 
            onChange={data => updateUnit(unit.id, { name: data })}
            onFocus={() => setFocusedCell({ rowIndex: j, colIndex: -1 })}
            onBlur={() => setFocusedCell(null)}
            onTab={modifiers=>onTab(modifiers, j, -1)}
            onEnter={modifiers=>onEnter(modifiers, j, -1)}
            onEscape={() => setFocusedCell(null)}
            onPaste={e=>onPaste(e, j, -1)} 
          />
        ))}
      </div>
      <HeaderCell dark value="+ Add" onClick={onAdd} />
    </DataTableColumn>
  );

  const leftPercentColumn = (
    <DataTableColumn width={60}>
      <div className="sticky top-0" >
        <ProgressCell dark noEdit progress={calculatedData.progress} />
        <HeaderCell dark noEdit value="Prog." className="text-left text-sm" />
      </div>
      {(units || []).map((unit, j) => {
        const progress = calculatedData.units[unit.id].completedSqftProgress;
        const isCompleted = calculatedData.units[unit.id].isCompleted;

        return (
          <ProgressCell dark key={j} noEdit progress={isCompleted ? 100 : progress} />
        )
      })}

    </DataTableColumn>
  );

  const columns = (accounts|| []).map((account, i) => {
    const accountProgress = calculatedData.accounts[account.id].progress;
    const isAccountCompleted = calculatedData.accounts[account.id].isCompleted;

    return (
      <DataTableColumn key={i} width={150}>
        <div className="sticky top-0 tour-first-step" style={{ zIndex: 1 }}>
          <ProgressCell dark noEdit progress={isAccountCompleted ? 100 : accountProgress} />
          <HeaderCell 
            value={account.name} 

            isFocused={focusedCell?.rowIndex === -1 && focusedCell?.colIndex === i} 
            onChange={data => updateAccount(account.id, { name: data })}
            onFocus={() => setFocusedCell({ rowIndex: -1, colIndex: i })}
            onBlur={() => setFocusedCell(null)}
            onTab={modifiers=>onTab(modifiers, -1, i)}
            onEnter={modifiers=>onEnter(modifiers, -1, i)}
            onEscape={() => setFocusedCell(null)}
            onPaste={e=>onPaste(e, -1, i)} 
          />
        </div>
        {/* <HeaderCell value={account.name} onClick={_=>router.push(`/p/${shortcode.name}/${unit.name}`)} /> */}
        <div className="tour-fourth-step" >
          {(units|| []).map((unit, j) => {
            const completed = calculatedData.units[unit.id].accounts[account.id].completed;
            const total = calculatedData.units[unit.id].accounts[account.id].total;
            const progress = calculatedData.units[unit.id].accounts[account.id].progress;
            const isCompleted = calculatedData.units[unit.id].accounts[account.id].isCompleted;
            const nextUnit = units[j+1];
            const nextAccount = accounts[i+1];
            const prevUnit = units[j-1];
            const prevAccount = accounts[i-1];

            const markCompleted = (account) => {
              markUnitCompleteForAccount(unit.id, account.id);
            }

            const unmarkCompleted = (account) => {
              unmarkUnitCompleteForAccount(unit.id, account.id);
            }

            // toggle mark complete
            const toggleCompleted = e => {
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
                data={total || "0"} 
                value={total || "0"} 
                progress={progress || (isCompleted ? 100 : 0)} 
                textClassName={textClassName} 
                barClassName={barClassNames} 
                className={classNames} 

                onClickComplete={e => toggleCompleted()}

                isFocused={focusedCell && focusedCell.rowIndex === j && focusedCell.colIndex === i}
                onChange={data => onTakeoffChange(unit.id, account.id, data)}
                onFocus={() => setFocusedCell({ rowIndex: j, colIndex: i })}
                onBlur={() => setFocusedCell(null)}
                onTab={modifiers=>onTab(modifiers, j, i)}
                onEnter={modifiers=>onEnter(modifiers, j, i)}
                onEscape={() => setFocusedCell(null)}
                onPaste={e=>onPaste(e, j, i)}
              />
            )
          })}
        </div>
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
            {/* <a className="text-sm text-slate-800 bg-yellow-400 p-2 px-2 lg:px-4 ml-2">Upload Takeoff</a> */}
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
                <HeaderCell dark noEdit value="+ Add" onClick={onAddAccount} />
              </div>
            </DataTableColumn>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountsDataTable;
