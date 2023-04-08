import React, { useContext } from 'react';
import UnitAttributesDataTable from './UnitAttributesDataTable';
import AccountsDataTable from './AccountsDataTable';
import PulseAccountsDataTable from './PulseAccountsDataTable';
import ScrollContext, { ScrollProvider } from './contexts/ScrollContext';
import FixedButton from './FixedButton';
import FileDrawer from './FileDrawer';

const RightScrollingPane = () => {
  const { scrollPosition, setScrollPosition, drawerWidth, drawerRight } = useContext(ScrollContext);
  const LEFT_WIDTH = 200;

  const onScroll = (e) => {
    setScrollPosition(e.target.scrollLeft);
  };

  return (

    // <FixedButton />
    <div className="flex h-full">
      <FileDrawer />
      <PulseAccountsDataTable leftWidth={LEFT_WIDTH} />
    </div>
  );
};

export default RightScrollingPane;
