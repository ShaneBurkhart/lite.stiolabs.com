import { v4 as uuidv4 } from 'uuid';

const DEFAULT_UNITS = ["Lobby", "Fitness", "L1 Hallway", "L2 Hallway"]
for (let floor = 1; floor <= 2; floor++) {
	for (let unit = 1; unit <= 5; unit++) {
		DEFAULT_UNITS.push(`${floor}0${unit}`);
	}
}
const DEFAULT_ACCOUNTS = ["Layout", "Frame", "Hang Ceilings", "Hang Bottoms", "Hang Mids", "Hang Tops"]
// for (let i = 1; i <= 5; i++) {
	// DEFAULT_ACCOUNTS.push(`Step ${i}`);
// }
export const DEFAULT_PROJECT = {
	name: "HEB Plano - 123 S. First St.",
	units: DEFAULT_UNITS.map(name => ({ name, id: uuidv4() })),
	accounts: DEFAULT_ACCOUNTS.map(name => ({ name, id: uuidv4() })),
};

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
		...DEFAULT_PROJECT,
		...(data || {}),
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
	if (typeof data.data !== 'number') return false;

	addEvent("UnitTakeoffDataUpdated", { ...data })
})

export const markUnitCompleteForAccount = wrap((data, addEvent, project, user) => {
	const units = project.units || [];
	const unit = units.find((unit) => unit.id === data.unit);
	if (!unit) return false;

	const accounts = project.accounts || [];
	const account = accounts.find((account) => account.id === data.account);
	if (!account) return false;

	const unitCount = 1

	// const takeoffData = project.takeoffData || {};
	// const unitData = takeoffData[unit.name];
	// if (!unitData) return false;
	// const accountData = unitData[account.name] || {};
	// if (!accountData) return false;

	const currentCompleted = project.markedCompleted || {};
	const currentCompletedForUnit = currentCompleted[data.unit] || {};
	const currentCompletedForAccount = currentCompletedForUnit[data.account] || 0;

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

	const currentCompleted = project.markedCompleted || {};
	const currentCompletedForUnit = currentCompleted[data.unit] || {};
	const currentCompletedForAccount = currentCompletedForUnit[data.account] || 0;

	if (currentCompletedForAccount <= 0) return false;

	addEvent("UnitUncompletedForAccount", {
		unit: unit.id,
		account: account.id,
	})
})