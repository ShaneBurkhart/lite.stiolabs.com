import React, { useContext } from 'react';
import UnitAttributesList from './UnitAttributesList';
import AccountsList from './AccountsList';
import ScrollContext from './contexts/ScrollContext';

const LeftFrozenPane = () => {
  const { scrollPosition, drawerWidth, drawerStyle, drawerMarginLeft, onFocusDrawer } = useContext(ScrollContext);

  return (
    <div 
      className="absolute top-0 left-0 h-screen bg-gray-200 p-4 text-gray-700" 
      style={drawerStyle}
      onClick={onFocusDrawer}
    >
      <UnitAttributesList />
      <AccountsList />
    </div>
  );
};

export default LeftFrozenPane;
