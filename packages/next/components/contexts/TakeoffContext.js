import React, { createContext, useRef, useState, useEffect } from 'react';
import * as COMMANDS from '@/lib/commands';
import * as EVENTS from '@/lib/events';
import { useRouter } from 'next/router';

import { RingLoader } from 'react-spinners';
import tw from 'tailwind-styled-components';

const LoadingContainer = tw.div`
  h-screen w-full flex justify-center items-center
`;

const DEFAULT_UNITS = ['A1', 'A2', 'A3', 'B1', 'A1.1', 'A2.1', 'A3.1', 'B1.1', 'A1.2', 'A2.2', 'A3.2', 'B1.2'];
DEFAULT_UNITS.forEach((name, i) => DEFAULT_UNITS.push(`${name}.${i}`));
for (let i = 0; i < 100; i++) DEFAULT_UNITS.push(`A${i}`);
const DEFAULT_ACCOUNTS = [
	'layout exterior walls',
	'frame exterior walls',
	'layout interior walls',
	'frame interior walls',
	'frame ceilings',
	'hang ceilings/furr downs', 
	'hang bottoms',
	'hang mids',
	'hang tops',
	'tape and corner',
]
const DEFAULT_PROJECT = {
	name: "368 Omni Hotel",
	units: DEFAULT_UNITS.map(name => ({ name })),
	accounts: DEFAULT_ACCOUNTS.map(name => ({ name })),
}

const TakeoffContext = createContext({
	shortcode: null,
	project: DEFAULT_PROJECT,
	units: [],
	unitAttributes: {},

	units: [],
	addUnit: () => {},
	removeUnit: () => {},

	changeName: () => {},

	accounts: [],
	addAccount: () => {},
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
      console.log(data);
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

		const newProject = newEvents.reduce(reduceProject, project);
		setProject(newProject);
	}

	const changeName = (name) => {
		runAndSave("updateProjectName", { name });
	}

	const addUnit = (unit) => {
		runAndSave("addUnit", { name: unit });
	}

	const addAccount = (account) => {
		runAndSave("addAccount", { name: account });
	}

	const updateUnitInfo = (unit, info) => {
		runAndSave("updateUnitInfo", { unit, info });
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
				shortcode,
				units,
				unitAttributes,
				addUnit,
				project,
				addAccount,
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
