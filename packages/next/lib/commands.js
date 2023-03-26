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