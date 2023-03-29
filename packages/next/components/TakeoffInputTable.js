import React, { useContext } from 'react';
import LeftFrozenPane from './LeftFrozenPane';
import RightScrollingPane from './RightScrollingPane';
import ScrollContext from './contexts/ScrollContext';

const TakeoffInputTable = () => {
  const { scrollPosition, setScrollPosition, drawerWidth, drawerRight } = useContext(ScrollContext);

  const onScroll = (e) => {
    setScrollPosition(e.target.scrollLeft);
  };

  return (
    <div className="flex overflow-scroll" style={{ minHeight: "100vh" }} onScroll={onScroll}>
      <div className="relative">
        {/* <LeftFrozenPane /> */}
        <RightScrollingPane />
      </div>
    </div>
  );
};

export default TakeoffInputTable;
