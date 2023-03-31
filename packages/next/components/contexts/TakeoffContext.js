import React, { createContext, useRef, useState, useEffect } from 'react';
import * as COMMANDS from '@/lib/commands';
import * as EVENTS from '@/lib/events';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

import { RingLoader } from 'react-spinners';
import tw from 'tailwind-styled-components';

const LoadingContainer = tw.div`
  h-screen w-full flex justify-center items-center
`;

const DEFAULT_UNITS = ["Lobby", "Fitness", "L1 Hallway", "L2 Hallway"]
for (let floor = 1; floor <= 2; floor++) {
	for (let unit = 1; unit <= 5; unit++) {
		DEFAULT_UNITS.push(`${floor}0${unit}`);
	}
}
const DEFAULT_ACCOUNTS = []
for (let i = 1; i <= 5; i++) {
	DEFAULT_ACCOUNTS.push(`Step ${i}`);
}
const DEFAULT_PROJECT = {
	name: "368 Omni Hotel",
	units: DEFAULT_UNITS.map(name => ({ name, id: uuidv4() })),
	accounts: DEFAULT_ACCOUNTS.map(name => ({ name, id: uuidv4() })),
}

const TakeoffContext = createContext({
	shortcode: null,
	project: DEFAULT_PROJECT,
	units: [],
	unitAttributes: {},

	units: [],
	addUnit: () => {},
	updateUnit: () => {},
	removeUnit: () => {},

	changeName: () => {},

	accounts: [],
	addAccount: () => {},
	updateAccount: () => {},
	removeAccount: () => {},

	updateUnitInfo: () => {},
	updateTakeoffData: () => {},

	markUnitCompleteForAccount: () => {},
	unmarkUnitCompleteForAccount: () => {},
});

export const TakeoffProvider = ({ children }) => {
  const router = useRouter();
  const { shortcode } = router.query;
  const [loading, setLoading] = useState(true);
	const _isLoaded = useRef(false)

	const [unitAttributes, setUnitAttributes] = useState({});
	const units = Object.keys(unitAttributes);

	const [project, setProject] = useState(DEFAULT_PROJECT);
	const isNewProject = !project.id;

  useEffect(() => {
		if (_isLoaded.current) return;

    const fetchShortCode = async () => {
      const res = await fetch('/api/shortcode/'+shortcode, {
        method: 'POST',
      });
      const data = await res.json();
			_isLoaded.current = true;
      setLoading(false);
    };

    fetchShortCode();
  }, []);

	const execCommand = (command, data) => {
		console.log("execCommand", COMMANDS)
		const handler = COMMANDS[command];
		if (!handler) throw new Error(`Command ${command} not found`);
		const events = []
		const addEvent = (type, data) => { events.push({ type, data }); }

		const success = handler(data, addEvent, project, null);
		// match false specifically, because we want to allow undefined to be returned
		if (success === false) return null;
		return events;
	}

	const reduceProject = (project, event) => {
		const reducer = EVENTS[event.type];
		if (!reducer) throw new Error(`Reducer ${event.type} not found`);
		return reducer(project, event.data);
	}

	const runAndSave = (commandName, data) => {
		const newEvents = execCommand(commandName, data);
		console.log("newEvents", newEvents);
		if (!newEvents) return;

		setProject(prevProj => newEvents.reduce(reduceProject, prevProj));
	}

	const changeName = (name) => {
		runAndSave("updateProjectName", { name });
	}

	const addUnit = (unit) => {
		const id = uuidv4();
		runAndSave("addUnit", { id, name: unit });
		return id
	}

	const updateUnit = (unit, data) => {
		runAndSave("updateUnit", { id: unit, data });
	}

	const addAccount = (account) => {
		const id = uuidv4();
		runAndSave("addAccount", { id, name: account });
		return id
	}

	const updateAccount = (account, data) => {
		runAndSave("updateAccount", { id: account, data });
	}

	const updateUnitInfo = (unit, info) => {
		runAndSave("updateUnitInfo", { id: unit, info });
	}

	const updateTakeoffData = (unit, account, data) => {
		runAndSave("updateTakeoffData", { unit, account, data });
	}

	const removeAccount = (account) => {
		runAndSave("removeAccount", { name: account });
	}

	const markUnitCompleteForAccount = (unit, account) => {
		runAndSave("markUnitCompleteForAccount", { unit, account });
	}

	const unmarkUnitCompleteForAccount = (unit, account) => {
		runAndSave("unmarkUnitCompleteForAccount", { unit, account });
	}

	if (loading) {
		return (
			<LoadingContainer>
				<RingLoader color="#3B82F6" size={80} />
			</LoadingContainer>
		)
	}

  return (
    <TakeoffContext.Provider
      value={{
				project,
				shortcode,
				units,
				unitAttributes,

				addUnit,
				updateUnit,
				
				addAccount,
				updateAccount,
				removeAccount,

				changeName,

				updateUnitInfo,
				updateTakeoffData,

				markUnitCompleteForAccount,
				unmarkUnitCompleteForAccount
      }}
    >
      {children}
    </TakeoffContext.Provider>
  );
};

export default TakeoffContext;
