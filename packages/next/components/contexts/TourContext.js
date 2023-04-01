import React, { createContext, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
const Tour = dynamic(() => import('reactour'), { ssr: false });

const r = () => Math.round(Math.random() * 500);
// add data to clipboard
const COPY_DATA = [
	["Unit 101", r(), r(), r(), r()],
	["Unit 102", r(), r(), r(), r()],
	["Unit 103", r(), r(), r(), r()],
	["Unit 104", r(), r(), r(), r()],
	["Unit 105", r(), r(), r(), r()],
].reduce((acc, row) => {
	return acc + row.join('\t') + '\n';
}, '');

async function copyToClipboard(textToCopy) {
	// Navigator clipboard api needs a secure context (https)
	if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(textToCopy);
	} else {
		alert('Copy to clipboard failed.');
	}
}

const steps = [
  {
		// WELCOME
    selector: "",
    content: (
			<>
				<h3 className="text-slate-400 text-xl font-bold">Welcome!</h3>
				<h3 className="text-slate-900 text-xl font-bold mb-3">This is our Production Tracking app.</h3>
				<p className="text-slate-900">Use it to document and analyze project progress in real time.</p>
			</>
		)
  },
  {
		// ACCOUNTS
    selector: '.tour-first-step',
    content: (
			<>
				<h3 className="text-slate-400 text-xl font-bold">Accounts.</h3>
				<h3 className="text-slate-900 text-xl font-bold mb-3">Columns are steps to complete.</h3>
				<p className="text-slate-900">These are usually the different phases of a project or steps in prefab production.</p>
			</>
		)
  },
  {
		// UNITS
    selector: '.tour-second-step',
    content: (
			<>
				<h3 className="text-slate-400 text-xl font-bold">Units.</h3>
				<h3 className="text-slate-900 text-xl font-bold mb-3">Rows are the units of a project.</h3>
				<p className="text-slate-900">For the jobsite, you might use unit numbers and room names whereas in prefab, you might use wall panel names, etc.</p>
			</>
		)
  },
  {
		// PASTE
    selector: '.tour-third-step',
    content: (props) => {
			const [copied, setCopied] = useState(false);

			return (
				<>
					<h3 className="text-slate-400 text-xl font-bold">Takeoff Data.</h3>
					<h3 className="text-slate-900 text-xl font-bold mb-3">Paste data from excel into any cell.</h3>
					<p className="text-slate-900">You can paste into any cell but this one let's you paste the entire sheet at once.</p>
					<button 
						className="bg-slate-500 text-white font-bold py-2 px-4 mt-2 rounded"
						onClick={() => { 
							copyToClipboard(COPY_DATA) 
							setCopied(true);
						}}
					>{copied ? 'Copied!' : 'Copy Example Data'}</button>
				</>
			)
		}
  },
  {
		// MARK COMPLETE
    selector: '.tour-fourth-step',
    content: (props) => (
			<>
				<h3 className="text-slate-400 text-xl font-bold">Mark Complete.</h3>
				<h3 className="text-slate-900 text-xl font-bold mb-3">Click the checkmark when you complete a step.</h3>
				<p className="text-slate-900">As you work on the project, mark of the parts you complete. Progress will be tracked automatically.</p>
				<button 
					className="bg-slate-500 text-white font-bold py-2 px-4 mt-2 rounded"
					onClick={() => { 
						props.close();
					}}
				>Close Tour</button>
			</>
		)
  },
]

const TourContext = createContext({
	openTour: false,
	setOpenTour: () => {},
});

export const TourProvider = ({ children }) => {
	const router = useRouter();
  const [openTour, setOpenTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');

    if (!hasSeenTour) {
      setOpenTour(true);
      localStorage.setItem('hasSeenTour', 'true');
    }
  }, []);

	return (
		<TourContext.Provider value={{ openTour, setOpenTour }}>
			<>
				{children}
				{Tour && (
					<Tour
						key="tour"
						position="top"
						steps={steps}
						isOpen={openTour}
						onRequestClose={_=>setOpenTour(false)} 
					/>
				)}
			</>
		</TourContext.Provider>
	);
}

export default TourContext;