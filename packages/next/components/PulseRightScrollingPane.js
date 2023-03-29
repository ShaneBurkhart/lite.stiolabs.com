import React, { useContext } from 'react';
import UnitAttributesDataTable from './UnitAttributesDataTable';
import AccountsDataTable from './AccountsDataTable';
import PulseAccountsDataTable from './PulseAccountsDataTable';
import ScrollContext, { ScrollProvider } from './contexts/ScrollContext';

const RightScrollingPane = () => {
  const { scrollPosition, setScrollPosition, drawerWidth, drawerRight } = useContext(ScrollContext);
  const LEFT_WIDTH = 200;

  const onScroll = (e) => {
    setScrollPosition(e.target.scrollLeft);
  };

  return (
    <PulseAccountsDataTable leftWidth={LEFT_WIDTH} />
  );
};

export default RightScrollingPane;
