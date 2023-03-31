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

export const updateProjectName = wrap((data, addEvent, project, user) => {
	if (!data.name) return false;
	addEvent("ProjectNameUpdated", {
		name: data.name,
	})
})

export const addAccount = wrap((data, addEvent, project, user) => {
	const accounts = project.accounts || [];
	if (!data.id) return false;
	if (typeof data.name !== "string") return false;
	if (accounts.find((account) => account.id === data.id)) return false;

	addEvent("AccountAdded", {
		id: data.id,
		name: data.name,
	})
})

export const updateAccount = wrap((data, addEvent, project, user) => {
	const accounts = project.accounts || [];
	const account = accounts.find((account) => account.id === data.id);
	if (!account) return false;
	if (!data.data || typeof data.data !== "object") return false;

	addEvent("AccountUpdated", data)
})

export const removeAccount = wrap((data, addEvent, project, user) => {
	const accounts = project.accounts || [];
	if (!accounts.find((account) => account.id === data.id)) return false;

	addEvent("AccountRemoved", {
		id: data.id,
	})
})

export const addUnit = wrap((data, addEvent, project, user) => {
	const units = project.units || [];
	if (!data.id) return false;
	if (typeof data.name !== "string") return false;
	if (units.find((unit) => unit.id === data.id)) return false;

	addEvent("UnitAdded", {
		id: data.id,
		name: data.name,
	})
})

export const updateUnit = wrap((data, addEvent, project, user) => {
	const units = project.units || [];
	const unit = units.find((unit) => unit.id === data.id);
	if (!unit) return false;
	if (!data.data || typeof data.data !== "object") return false;

	console.log("updateUnit", data, unit);
	addEvent("UnitUpdated", data);
})

export const removeUnit = wrap((data, addEvent, project, user) => {
	const units = project.units || [];
	if (!units.find((unit) => unit.id === data.id)) return false;

	addEvent("UnitRemoved", {
		id: data.id,
	})
})

export const updateUnitInfo = wrap((data, addEvent, project, user) => {
	const unitsInfo = project.unitsInfo || {};
	const unitInfo = unitsInfo[data.unit] || {};

	addEvent("UnitInfoUpdated", { ...unitInfo, ...data })
})

export const updateTakeoffData = wrap((data, addEvent, project, user) => {
	if (!data.unit) return false;
	if (!data.account) return false;
	if (!data.data) return false;

	addEvent("UnitTakeoffDataUpdated", { ...data })
})

export const markUnitCompleteForAccount = wrap((data, addEvent, project, user) => {
	const units = project.units || [];
	const unit = units.find((unit) => unit.id === data.unit);
	if (!unit) return false;

	const accounts = project.accounts || [];
	const account = accounts.find((account) => account.id === data.account);
	if (!account) return false;

	const unitsInfo = project.unitsInfo || {};
	const unitInfo = unitsInfo[data.unit] || {};
	// const unitCount = unitInfo.count || 0;
	const unitCount = 1

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
		unit: unit.id,
		account: account.id,
	})
})

export const unmarkUnitCompleteForAccount = wrap((data, addEvent, project, user) => {
	const units = project.units || [];
	const unit = units.find((unit) => unit.id === data.unit);
	if (!unit) return false;

	const accounts = project.accounts || [];
	const account = accounts.find((account) => account.id === data.account);
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
		unit: unit.id,
		account: account.id,
	})
})