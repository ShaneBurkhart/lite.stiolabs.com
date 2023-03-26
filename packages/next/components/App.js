import React from 'react';
import TakeoffInputTable from './TakeoffInputTable';
import { ScrollProvider } from './contexts/ScrollContext';

// TakeoffInputTable
	// LeftFrozenPane
		// UnitAttributesList
		// AccountsList
	// RightScrollingPane
		// UnitAttributesDataTable
		// AccountsDataTable

const ScrollWrapper = () => {
  return (
    <ScrollProvider>
      <RightScrollingPane />
    </ScrollProvider>
  )
}



export default function App() {
	return (
		<ScrollProvider>
			<TakeoffInputTable />
		</ScrollProvider>
	);
}