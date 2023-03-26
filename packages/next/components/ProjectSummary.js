import Link from 'next/link';
import React, { useContext } from 'react';
import TakeoffContext from './contexts/TakeoffContext';
import ProgressBar from './ProgressBar';

// things to include in project summary
// 1. walkthrough steps
	// 1.1. add project details
	// 1.2. add units, accounts and takeoff data
	// 1.3. mark units as completed
	// 1.4. export production data
// 2. project details
	// 2.1. project name
// 3. project stats
	// 3.1. total percent completed
	// 3.2. total completed by units

const ProjectSummary = () => {
	const { shortcode, project } = useContext(TakeoffContext);
	const projectName = project.name || "Untitled project";
	const units = project.units || [];

  return (
    <div className="flex overflow-scroll" style={{ minHeight: "100vh" }} >
      <div className="relative">
				<div>
					<div>
						<h2>{projectName}</h2>
					</div>

					<div>
						<h2>Walkthrough steps</h2>
						<ol className="list-decimal list-outside pl-6">
							<li>Add project details</li>
							<li><Link href={"/p/"+shortcode+"/takeoff"}>Add units, accounts and takeoff data</Link></li>
							<li>Mark units as completed</li>
							<li>Export production data</li>
						</ol>
					</div>

					<div>
						<h2>Project completion</h2>
						<p>Total</p>
						<ProgressBar progress={0}/>

						{units.map(unit => {
							return (
								<Link href={"/p/"+shortcode+"/"+unit.name}>
									<p>{unit.name}</p>
									<ProgressBar progress={0}/>
								</Link>
							)
						})}
					</div>
				</div>
      </div>
    </div>
  );
};

export default ProjectSummary;

