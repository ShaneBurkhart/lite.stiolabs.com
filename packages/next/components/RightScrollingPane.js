import React, { useContext } from 'react';
import UnitAttributesDataTable from './UnitAttributesDataTable';
import AccountsDataTable from './AccountsDataTable';
import ScrollContext, { ScrollProvider } from './contexts/ScrollContext';

const RightScrollingPane = () => {
  const { scrollPosition, setScrollPosition, drawerWidth, drawerRight } = useContext(ScrollContext);
  const LEFT_WIDTH = 200;

  const onScroll = (e) => {
    setScrollPosition(e.target.scrollLeft);
  };

  return (
    <div 
      className="flex flex-col min-h-full" 
      // style={{ marginLeft: 200, top: 0, right: 0, bottom: 0 }}
    >
      {/* <UnitAttributesDataTable leftWidth={LEFT_WIDTH} /> */}
      <AccountsDataTable leftWidth={LEFT_WIDTH} />
    </div>
  );
};

export default RightScrollingPane;
