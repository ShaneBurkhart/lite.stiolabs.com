import React, { createContext, useState, useRef } from 'react';

const INITIAL_DRAWER_WIDTH = 200;
const MAX_COLLAPSED_DRAWER_WIDTH = 170;

const INITIAL_DRAWER_STYLE = { width: INITIAL_DRAWER_WIDTH, left: 0, position: 'fixed' };

const ScrollContext = createContext({
  scrollPosition: 0,
  _scrollPosition: null,
  setScrollPosition: () => {},

  drawerWidth: 0,
  drawerMarginLeft: 0,
  drawerRight: INITIAL_DRAWER_WIDTH,
  drawerStyle: INITIAL_DRAWER_STYLE,
  onFocusDrawer: () => {},
});

export const ScrollProvider = ({ children }) => {
  const [scrollPosition, _setScrollPosition] = useState(0);
  const _lastScrollPosition = useRef(0);
  const _lastFixedPosition = useRef(0);
  const _scrollPosition = useRef(0);
  const _needsUpdated = useRef(false);

  const [drawerWidth, setDrawerWidth] = useState(INITIAL_DRAWER_WIDTH);
  const [drawerStyle, setDrawerStyle] = useState(INITIAL_DRAWER_STYLE);


  const setScrollPosition = (_position) => {
    const position = Math.max(0, _position);
    const newVelocity = position - _lastScrollPosition.current;
    const newStyle = { ...drawerStyle, width: drawerWidth };

    // _setScrollPosition(position);
    // setDrawerMarginLeft(Math.max(0, Math.min(drawerMarginLeft + newVelocity, MAX_COLLAPSED_DRAWER_WIDTH)));

    // const furthestLeft = position - MAX_COLLAPSED_DRAWER_WIDTH;

    _scrollPosition.current = position; 
    _lastScrollPosition.current = position;
  }

  const onFocusDrawer = () => {
    // setDrawerMarginLeft(0);
  }

  return (
    <ScrollContext.Provider value={{ 
      scrollPosition, 
      setScrollPosition, 
      _scrollPosition,
      drawerWidth,
      drawerMarginLeft: 0,
      drawerRight: drawerWidth + 0,
      drawerStyle,
      onFocusDrawer,
    }}>
      {children}
    </ScrollContext.Provider>
  );
};

export default ScrollContext;
