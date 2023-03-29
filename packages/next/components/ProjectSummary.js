import Link from 'next/link';
import React, { useContext, useState } from 'react';
import TakeoffContext from './contexts/TakeoffContext';
import ProgressBar from './ProgressBar';

// things to include in project summary
// 1. walkthrough steps
	// 1.1. add project details
	// 1.2. add units, accounts and takeoff data
	// 1.3. mark units as completed
	// 1.4. export production data
// 2. project details
	// 2.1. project name
// 3. project stats
	// 3.1. total percent completed
	// 3.2. total completed by units

const ProjectSummary = () => {
	const { shortcode, project } = useContext(TakeoffContext);
	const [search, setSearch] = useState('');
	const projectName = project.name || "Untitled project";
	const units = project.units || [];
	const accounts = project.accounts || [];
	const takeoffData = project.takeoffData || {};
	const unitsInfo = project.unitsInfo || {};
	const markedCompleted = project.markedCompleted || {};

	const unitsProduction = units.map(unit => {
		const accountsMarkedCompleted = markedCompleted[unit.name] || {};
		const unitInfo = unitsInfo[unit.name] || {};
		const unitTakeoffData = takeoffData[unit.name] || {};
		const unitCount = unitInfo.count || 0;
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

  return (
    <div className="max-w-lg mx-auto pt-4">
      <div className="relative">
				<div>
					<div>
						<h2 className="text-3xl font-bold mb-6">{projectName}</h2>
					</div>

					<div className="mb-8 border p-2 bg-gray-800">
						<h2 className="text-xl font-bold mb-2">Walkthrough steps</h2>
						<ol className="list-decimal list-outside pl-6">
							<li>Add project details</li>
							<li><Link href={"/p/"+shortcode+"/takeoff"}>Add units, accounts and takeoff data</Link></li>
							<li>Mark units as completed</li>
							<li>Export production data</li>
						</ol>
					</div>

					<div>
						<h2 className="text-xl font-bold mb-2">Project completion</h2>
						<div className="border p-2 bg-gray-800 mb-6">
							<p className="mb-1 text-lg">Production Total</p>
							<ProgressBar progress={totalCompletedSqftProgress} />
							<p className="text-sm">{totalCompletedSqft.toLocaleString()} / {totalSqft.toLocaleString()} sqft</p>
						</div>

						<h2 className="text-xl font-bold mb-2">Unit completion</h2>
						<input 
							type="text" 
							value={search}
							className="border p-2 mb-4 w-full" 
							placeholder="Search units" 
							onChange={e => setSearch(e.target.value)}
						/>
						{units.filter(unit => unit.name.toLowerCase().includes(search.toLowerCase())).map(unit => {
							const accountsMarkedCompleted = markedCompleted[unit.name] || {};
							const unitInfo = unitsInfo[unit.name] || {};
							const unitTakeoffData = takeoffData[unit.name] || {};
							const unitCount = unitInfo.count || 0;
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

							return (
								<Link href={"/p/"+shortcode+"/"+unit.name}>
									<div className="border p-2 bg-gray-800">
										<p>{unit.name}</p>
										<ProgressBar progress={completedSqftProgress}/>
										<p className="text-sm">{completedSqft.toLocaleString()} / {totalSqft.toLocaleString()} sqft</p>
									</div>
								</Link>
							)
						})}
					</div>
				</div>
      </div>
    </div>
  );
};

export default ProjectSummary;

