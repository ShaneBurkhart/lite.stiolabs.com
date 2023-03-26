const ensure = (fn) => {
	return (data, addEvent, project, user) => {
		return fn(data || {}, addEvent, project || {}, user || {});
	}
}

const wrap = (fn) => {
	return ensure(fn);
}

export const createProject = wrap((data, addEvent, project, user) => {
	addEvent("ProjectCreated", {
		id: data.id,
	})
})

export const addAccount = wrap((data, addEvent, project, user) => {
	const accounts = project.accounts || [];
	if (!data.name) return false;
	if (accounts.find((account) => account.name === data.name)) return false;

	addEvent("AccountAdded", {
		name: data.name,
	})
})

export const removeAccount = wrap((data, addEvent, project, user) => {
	const accounts = project.accounts || [];
	if (!accounts.find((account) => account.name === data.name)) return false;

	addEvent("AccountRemoved", {
		name: data.name,
	})
})

export const addUnit = wrap((data, addEvent, project, user) => {
	const units = project.units || [];
	if (!data.name) return false;
	if (units.find((unit) => unit.name === data.name)) return false;

	addEvent("UnitAdded", {
		name: data.name,
	})
})

export const removeUnit = wrap((data, addEvent, project, user) => {
	const units = project.units || [];
	if (!units.find((unit) => unit.name === data.name)) return false;

	addEvent("UnitRemoved", {
		name: data.name,
	})
})

export const updateUnitInfo = wrap((data, addEvent, project, user) => {
	const unitsInfo = project.unitsInfo || {};
	const unitInfo = unitsInfo[data.unit] || {};

	addEvent("UnitInfoUpdated", { ...unitInfo, ...data })
})

export const markUnitCompleteForAccount = wrap((data, addEvent, project, user) => {
	const units = project.units || [];
	const unit = units.find((unit) => unit.name === data.unit);
	if (!unit) return false;

	const accounts = project.accounts || [];
	const account = accounts.find((account) => account.name === data.account);
	if (!account) return false;

	const unitsInfo = project.unitsInfo || {};
	const unitInfo = unitsInfo[data.unit] || {};
	const unitCount = unitInfo.count || 0;

	// const takeoffData = project.takeoffData || {};
	// const unitData = takeoffData[unit.name];
	// if (!unitData) return false;
	// const accountData = unitData[account.name] || {};
	// if (!accountData) return false;

	console.log("markUnitCompleteForAccount", data, project, user);

	const currentCompleted = project.markedCompleted || {};
	const currentCompletedForUnit = currentCompleted[data.unit] || {};
	const currentCompletedForAccount = currentCompletedForUnit[data.account] || 0;

	console.log("currentCompletedForAccount", currentCompletedForAccount, unitCount);
	if (currentCompletedForAccount >= unitCount) return false;

	addEvent("UnitCompletedForAccount", {
		unit: unit.name,
		account: account.name,
	})
})

export const unmarkUnitCompleteForAccount = wrap((data, addEvent, project, user) => {
	const units = project.units || [];
	const unit = units.find((unit) => unit.name === data.unit);
	if (!unit) return false;

	const accounts = project.accounts || [];
	const account = accounts.find((account) => account.name === data.account);
	if (!account) return false;

	const unitsInfo = project.unitsInfo || {};
	const unitInfo = unitsInfo[data.unit] || {};
	const unitCount = unitInfo.count || 0;

	// const takeoffData = project.takeoffData || {};
	// const unitData = takeoffData[unit.name];
	// if (!unitData) return false;
	// const accountData = unitData[account.name] || {};
	// if (!accountData) return false;

	console.log("markUnitCompleteForAccount", data, project, user);

	const currentCompleted = project.markedCompleted || {};
	const currentCompletedForUnit = currentCompleted[data.unit] || {};
	const currentCompletedForAccount = currentCompletedForUnit[data.account] || 0;

	console.log("currentCompletedForAccount", currentCompletedForAccount, unitCount);
	if (currentCompletedForAccount <= 0) return false;

	addEvent("UnitUncompletedForAccount", {
		unit: unit.name,
		account: account.name,
	})
})