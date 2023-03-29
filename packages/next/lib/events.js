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