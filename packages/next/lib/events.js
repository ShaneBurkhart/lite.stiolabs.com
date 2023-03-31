const ensurePrevState = (fn) => {
	return (prevState, data) => {
		const _prevState = prevState || {};
		return fn(_prevState, data);
	}
}

const wrap = (fn) => {
	return ensurePrevState(fn);
}

export const ProjectNameUpdated = wrap((prevState, data) => {
	return {
		...prevState,
		name: data.name,
	}
})

export const AccountAdded = wrap((prevState, data) => {
	return {
		...prevState,
		accounts: [...(prevState.accounts || []), {
			id: data.id,
			name: data.name,
		}],
	}
})

export const AccountUpdated = wrap((prevState, data) => {
	const accounts = prevState.accounts || [];
	const account = accounts.find((account) => account.id === data.id);
	if (!account) return false;

	return {
		...prevState,
		accounts: accounts.map((account) => {
			if (account.id === data.id) {
				return {
					...account,
					...data.data,
				}
			}
			return account;
		}),
	}
})

export const AccountRemoved = wrap((prevState, data) => {
	return {
		...prevState,
		accounts: (prevState.accounts || []).filter((account) => account.id !== data.id ),
	}
})

export const UnitAdded = wrap((prevState, data) => {
	return {
		...prevState,
		units: [...(prevState.units || []), {
			id: data.id,
			name: data.name,
		}],
	}
})

export const UnitUpdated = wrap((prevState, data) => {
	const units = prevState.units || [];
	const unit = units.find((unit) => unit.id === data.id);
	if (!unit) return false;

	return {
		...prevState,
		units: units.map((unit) => {
			if (unit.id === data.id) {
				return {
					...unit,
					...data.data,
				}
			}
			return unit;
		}),
	}
})

export const UnitRemoved = wrap((prevState, data) => {
	return {
		...prevState,
		units: (prevState.units || []).filter((unit) => unit.id !== data.id),
	}
})

export const UnitInfoUpdated = wrap((prevState, data) => {
	const unitsInfo = prevState.unitsInfo || {};
	const unitInfo = unitsInfo[data.unit] || {};

	return {
		...prevState,
		unitsInfo: {
			...unitsInfo,
			[data.unit]: {
				...unitInfo,
				...data.info,
			},
		},
	}
})

export const UnitTakeoffDataUpdated = wrap((prevState, data) => {
	const takeoffData = prevState.takeoffData || {};
	const takeoffDataForUnit = takeoffData[data.unit] || {};
	const takeoffDataForAccount = takeoffDataForUnit[data.account] || 0;

	return {
		...prevState,
		takeoffData: {
			...takeoffData,
			[data.unit]: {
				...takeoffDataForUnit,
				[data.account]: data.data,
			},
		},
	}
})

export const UnitCompletedForAccount = wrap((prevState, data) => {
	const currentCompleted = prevState.markedCompleted || {};
	const currentCompletedForUnit = currentCompleted[data.unit] || {};
	const currentCompletedForAccount = currentCompletedForUnit[data.account] || 0;

	return {
		...prevState,
		markedCompleted: {
			...currentCompleted,
			[data.unit]: {
				...currentCompletedForUnit,
				[data.account]: currentCompletedForAccount + 1,
			},
		},
	}
})

export const UnitUncompletedForAccount = wrap((prevState, data) => {
	const currentCompleted = prevState.markedCompleted || {};
	const currentCompletedForUnit = currentCompleted[data.unit] || {};
	const currentCompletedForAccount = currentCompletedForUnit[data.account] || 0;

	return {
		...prevState,
		markedCompleted: {
			...currentCompleted,
			[data.unit]: {
				...currentCompletedForUnit,
				[data.account]: currentCompletedForAccount - 1,
			},
		},
	}
})