import React, { createContext, useRef, useState, useEffect } from 'react';
import _ from 'lodash';
import * as COMMANDS from '@/lib/commands';
import * as EVENTS from '@/lib/events';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

import { RingLoader } from 'react-spinners';
import tw from 'tailwind-styled-components';

const LoadingContainer = tw.div`
  h-screen w-full flex justify-center items-center
`;

const TakeoffContext = createContext({
	shortcode: null,
	project: COMMANDS.DEFAULT_PROJECT,
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

const reduceProject = (project, event) => {
	const reducer = EVENTS[event.eventType];
	if (!reducer) throw new Error(`Reducer ${event.eventType} not found`);
	return reducer(project, event.eventData);
}

export const TakeoffProvider = ({ children }) => {
  const router = useRouter();
  const { shortcode } = router.query;
  const [loading, setLoading] = useState(true);
	const _isLoaded = useRef(false)
	const _commandsBeingSent = useRef([])
	const _commandsWaitingToSend = useRef([])
	const _shortcode = useRef(shortcode)
	_shortcode.current = shortcode

	const _throttledSendCommands = useRef(_.throttle(async () => {
		if (!_commandsBeingSent.current.length) {
			// no commands being sent, so grab some from commands waiting to be sent
			_commandsBeingSent.current = _commandsWaitingToSend.current;
			_commandsWaitingToSend.current = [];
		}

		// send events to the server
		await fetch('/api/shortcode/'+_shortcode.current+'/save', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ commands: _commandsBeingSent.current }),
		});

		_commandsBeingSent.current = [];
	}, 1000)).current

	const [unitAttributes, setUnitAttributes] = useState({});
	const units = Object.keys(unitAttributes);

	const [project, setProject] = useState(COMMANDS.DEFAULT_PROJECT);
	const _project = useRef(project)
	_project.current = project
	const isNewProject = !project.id;

  useEffect(() => {
		if (!shortcode || _isLoaded.current) return;

    const fetchShortCode = async () => {
      const res = await fetch('/api/shortcode/'+shortcode+'/snapshot', {
        method: 'GET',
      });
			// console.log(await res.json())
      const data = await res.json();
			_isLoaded.current = true;
			setProject(Object.keys(data || {}).length === 1 ? COMMANDS.DEFAULT_PROJECT : data);
      setLoading(false);
    };

    const fetchEventsSince = async () => {
      const res = await fetch('/api/shortcode/'+shortcode+'/events_since?expectedVersion='+(_project.current.version||0), {
        method: 'GET',
      });
			// console.log(await res.json())
      const eventsSince = await res.json();
			eventsSince.forEach(event => event.eventData = JSON.parse(event.eventData))
			if (eventsSince && eventsSince.length) {
				setProject(prevState => ({ ...(eventsSince || []).reduce(reduceProject, prevState) }));
			}

			_isLoaded.current = true;
      setLoading(false);
    };

    fetchShortCode();

		const interval = setInterval(fetchEventsSince, 1000);
		return () => clearInterval(interval);
  }, [shortcode]);

	const execCommand = (command, data) => {
		const handler = COMMANDS[command];
		if (!handler) throw new Error(`Command ${command} not found`);
		const events = []
		const addEvent = (type, data) => { events.push({ eventType: type, eventData: data }); }

		const success = handler(data, addEvent, project, null);
		// match false specifically, because we want to allow undefined to be returned
		if (success === false) return null;
		return events;
	}

	const runAndSave = (commandName, data) => {
		const newEvents = execCommand(commandName, data);
		if (!newEvents) return;

		setProject(prevProj => newEvents.reduce(reduceProject, prevProj));
		_commandsWaitingToSend.current.push({ command: commandName, data });
		_throttledSendCommands();
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
