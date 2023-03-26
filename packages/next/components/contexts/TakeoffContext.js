import React, { createContext, useState } from 'react';
import * as COMMANDS from '@/lib/commands';
import * as EVENTS from '@/lib/events';

const DEFAULT_UNITS = ['A1', 'A2', 'A3', 'B1'];
const DEFAULT_ACCOUNTS = ['1001', '2001', '2002'];
const DEFAULT_PROJECT = {
	units: DEFAULT_UNITS.map(name => ({ name })),
	accounts: DEFAULT_ACCOUNTS.map(name => ({ name })),
}

const TakeoffContext = createContext({
	units: [],
	unitAttributes: {},
	project: DEFAULT_PROJECT,

	units: [],
	addUnit: () => {},
	removeUnit: () => {},

	accounts: [],
	addAccount: () => {},
	removeAccount: () => {},
});

export const TakeoffProvider = ({ children }) => {
	const [unitAttributes, setUnitAttributes] = useState({});
	const units = Object.keys(unitAttributes);

	const [project, setProject] = useState(DEFAULT_PROJECT);
	const isNewProject = !project.id;

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

	const addUnit = (unit) => {
		runAndSave("addUnit", { name: unit });
	}

	const addAccount = (account) => {
		runAndSave("addAccount", { name: account });
	}

	const removeAccount = (account) => {
		runAndSave("removeAccount", { name: account });
	}

  return (
    <TakeoffContext.Provider
      value={{
				units,
				unitAttributes,
				addUnit,
				project,
				addAccount,
				removeAccount,
      }}
    >
      {children}
    </TakeoffContext.Provider>
  );
};

export default TakeoffContext;
