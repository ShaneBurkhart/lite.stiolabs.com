import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TakeoffContext from '@/components/contexts/TakeoffContext';
import ProgressBar from '@/components/ProgressBar';

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
	const totalUnits = unitInfo.count || 0;
	const totalSqft = Object.values(unitTakeoffData).reduce((acc, accountData) => {
		return acc + accountData;
	}, 0);
	// const completedSqft = Object.values(accountsMarkedCompleted).reduce((acc, completed) => {

	console.log("UnitSummary", unitName, unit, accounts, unitInfo, accountsMarkedCompleted);

  return (
		<>
			<h2>{unitName}</h2>
			<p>Units ({unitInfo.count} total)</p>
			<ProgressBar progress={0} />
			<p>Sqft ({totalSqft})</p>
			<ProgressBar progress={0} />

			<br />

			{accounts.map((account, i) => {
				const completed = accountsMarkedCompleted[account.name] || 0;
				const total = unitInfo.count;
				const progress = completed / total * 100;

				return (
					<div key={i}>
						<h3>{account.name}</h3>
						<ProgressBar progress={progress} />
						<button onClick={() => unmarkCompleted(account)}>Minus</button>
						<span className="mx-2">{completed}/{total}</span>
						<button onClick={() => markCompleted(account)}>Plus</button>
					</div>
				)
			})}
		</>
  );
}

export default UnitSummary;
