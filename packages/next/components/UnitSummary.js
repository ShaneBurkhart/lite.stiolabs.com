import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TakeoffContext from '@/components/contexts/TakeoffContext';
import ProgressBar from '@/components/ProgressBar';
import Link from 'next/link';

function UnitSummary() {
	const router = useRouter();
	const unitName = router.query.unit;
	const { shortcode, project, markUnitCompleteForAccount, unmarkUnitCompleteForAccount } = useContext(TakeoffContext);
	const units = project.units || [];
	const unit = units.find(u => u.name === unitName);
	const accounts = project.accounts || [];
	const unitsInfo = project.unitsInfo || {};
	const unitInfo = unitsInfo[unitName] || {};
	const takeoffData = project.takeoffData || {};
	const markedCompleted = project.markedCompleted || {};
	const accountsMarkedCompleted = markedCompleted[unitName] || {};

	useEffect(() => {
		if (!unit) router.push('/p/'+shortcode);
	}, [unit]);

	const markCompleted = (account) => {
		markUnitCompleteForAccount(unitName, account.name);
	}

	const unmarkCompleted = (account) => {
		unmarkUnitCompleteForAccount(unitName, account.name);
	}

	const unitTakeoffData = takeoffData[unitName] || {};
	// const unitCount = unitInfo.count || 0;
	const unitCount = 1
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

	const completedSqftPerUnit = Array.from({length: unitCount}, (v, i) => {
		const completedSqft = accounts.reduce((acc, account) => {
			const takeoffData = unitTakeoffData[account.name] || 0;
			const completed = accountsMarkedCompleted[account.name] || 0;
			const accountCompleted = takeoffData * (i < completed ? 1 : 0);
			return acc + accountCompleted;
		}, 0);

		return completedSqft;
	})
	const num50completed = completedSqftPerUnit.filter(sqft => sqft >= totalSqft / unitCount * 0.5).length;
	const num75completed = completedSqftPerUnit.filter(sqft => sqft >= totalSqft / unitCount * 0.75).length;

	const missingAccounts = [];

	let unitsCompleted = accounts.reduce((acc, account) => {
		const completed = accountsMarkedCompleted[account.name] || 0;
		return Math.min(acc, completed);
	}, 999999);
	if (unitsCompleted === 999999) unitsCompleted = 0;
	const completedCountProgress = unitsCompleted === 0 ? 0 : unitsCompleted / unitCount * 100;

	let unitsStarted = accounts.reduce((acc, account) => {
		const completed = accountsMarkedCompleted[account.name] || 0;
		return Math.max(acc, completed);
	}, 0);
	const startedCountProgress = unitsStarted === 0 ? 0 : unitsStarted / unitCount * 100;

  return (
    <div className="max-w-lg mx-auto pt-4">
			<h2 className="text-3xl font-bold mb-6">{unitName}</h2>

			<h2 className="text-xl font-bold mb-2">Summary</h2>
			<div className="border p-2 pb-4 bg-gray-800 mb-1">
				<p className="mb-1">Total Production (sqft)</p>
				<ProgressBar progress={completedSqftProgress} />
				<div className="flex justify-between mt-2">
					<span>{completedSqft.toLocaleString()} / {totalSqft.toLocaleString()} completed sqft</span>
				</div>
			</div>

			{/* <div className="border p-2 pb-4 bg-gray-800 mb-1">
				<p className="mb-1">Started ({unitsStarted}/{unitCount})</p>
				<ProgressBar progress={startedCountProgress} />
			</div>

			<div className="border p-2 pb-4 bg-gray-800 mb-1">
				<p className="mb-1">25% Completed ({num25completed}/{unitCount})</p>
				<ProgressBar progress={num25completed/unitCount*100} />
			</div>

			<div className="border p-2 pb-4 bg-gray-800 mb-1">
				<p className="mb-1">50% Completed ({num50completed}/{unitCount})</p>
				<ProgressBar progress={num50completed/unitCount*100} />
			</div>

			<div className="border p-2 pb-4 bg-gray-800 mb-1">
				<p className="mb-1">75% Completed ({num75completed}/{unitCount})</p>
				<ProgressBar progress={num75completed/unitCount*100} />
			</div>

			<div className="border p-2 pb-4 bg-gray-800 mb-6">
				<p className="mb-1">100% Fully Completed ({unitsCompleted}/{unitCount})</p>
				<ProgressBar progress={completedCountProgress} />
			</div> */}

			{/* <h2 className="text-xl font-bold mb-2">Units Breakdown</h2>
			{completedSqftPerUnit.map((sqft, i) => {
				const progress = sqft === 0 ? 0 : sqft / (totalSqft / unitCount) * 100;
				return (
					<div key={i} className="border p-2 bg-gray-800 mb-1">
						<p className="mb-1">Unit {i+1} ({sqft.toLocaleString()} sqft)</p>
						<ProgressBar progress={progress} />
					</div>
				)
			})} */}

			<h2 className="text-xl font-bold mb-2 mt-6">Mark Completed</h2>
			{accounts.map((account, i) => {
				const completed = accountsMarkedCompleted[account.name] || 0;
				const total = 1;
				const progress = completed === 0 ? 0 :completed / total * 100;
				const takeoffData = unitTakeoffData[account.name] || 0;

				if (!total || total === 0) {
					missingAccounts.push(account.name);
					return null;
				}

				return (
					<div key={i}>
						<div className="border p-2 bg-gray-800 mb-1">
							<h3>{account.name}</h3>
							<ProgressBar progress={progress} />
							<div className="flex justify-between mt-2">
								<button 
									className="bg-red-500 text-white text-sm px-2 py-1 rounded" 
									onClick={() => unmarkCompleted(account)}
								>Incomplete</button>
								<span className="mx-2">{takeoffData.toLocaleString()} sqft</span>
								<button 
									className="bg-green-500 text-white text-sm px-2 py-1 rounded" 
									onClick={() => markCompleted(account)}
								>Completed</button>
							</div>
						</div>
					</div>
				)
			})}
			{!!missingAccounts.length && (
				<div>
					<h3>
						<span className="font-bold">Missing takeoff data for accounts</span> -&nbsp;
						<Link href={'/p/'+shortcode+'/takeoff'} className="text-red-500 underline mb-2">update them here</Link>
					</h3>
					<ul>
						{missingAccounts.map((account, i) => {
							return <li key={i}>{account}</li>
						})}
					</ul>
				</div>
			)}

			<h2 className="text-xl font-bold mb-2 mt-6">Time Series</h2>
			<div className="mb-4">
				<h3 className="font-bold">Monday - 3/23/2023 (today)</h3>
				<div className="flex justify-between">
					<p>1:25pm (cst) - 1001</p>
					<p>+1 completed</p>
				</div>
				<div className="flex justify-between">
					<p>1:23pm (cst) - 1001</p>
					<p>-1 completed</p>
				</div>
			</div>
			<div className="mb-4">
				<h3 className="font-bold">Friday - 3/20/2023</h3>
				<div className="flex justify-between">
					<p><span style={{ width: 110, display: 'inline-block' }}>9:38am (cst)</span> 2001</p>
					<p>+1 completed</p>
				</div>
				<div className="flex justify-between">
					<p><span style={{ width: 110, display: 'inline-block' }}>9:18am (cst)</span> 2001</p>
					<p>+1 completed</p>
				</div>
				<div className="flex justify-between">
					<p><span style={{ width: 110, display: 'inline-block' }}>9:08am (cst)</span> 2001</p>
					<p>+1 completed</p>
				</div>
				<div className="flex justify-between">
					<p><span style={{ width: 110, display: 'inline-block' }}>8:38am (cst)</span> 2001</p>
					<p>-1 completed</p>
				</div>
			</div>
		</div>
  );
}

export default UnitSummary;


