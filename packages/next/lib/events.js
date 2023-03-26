const ensurePrevState = (fn) => {
	return (prevState, data) => {
		const _prevState = prevState || {};
		return fn(_prevState, data);
	}
}

const wrap = (fn) => {
	return ensurePrevState(fn);
}

export const AccountAdded = wrap((prevState, data) => {
	return {
		...prevState,
		accounts: [...(prevState.accounts || []), {
			name: data.name,
		}],
	}
})

export const AccountRemoved = wrap((prevState, data) => {
	return {
		...prevState,
		accounts: (prevState.accounts || []).filter((account) => account.name !== data.name),
	}
})

export const UnitAdded = wrap((prevState, data) => {
	return {
		...prevState,
		units: [...(prevState.units || []), {
			name: data.name,
		}],
	}
})

export const UnitRemoved = wrap((prevState, data) => {
	return {
		...prevState,
		units: (prevState.units || []).filter((unit) => unit.name !== data.name),
	}
})