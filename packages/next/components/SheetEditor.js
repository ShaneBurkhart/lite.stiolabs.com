import React, { useContext, useState, useRef, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import _ from 'underscore';

import { SheetEditorContext } from './contexts/SheetEditorContext';
// import { UndoRedoContext } from '../contexts/UndoRedoContext';
// import { CopyPasteContext } from '../contexts/CopyPasteContext';

import Subheader from './SheetEditor/Subheader';
import CanvasWorld from './SheetEditor/CanvasWorld';
import FileDrawer from './FileDrawer';
import Dropzone from './Dropzone';


export default function SheetEditor() {
  // const { undo, redo } = useContext(UndoRedoContext);
  // const { copy, paste } = useContext(CopyPasteContext);
  // const { sheet, pollInfo, selectedShapes } = useContext(SheetEditorContext);
  // const { snapshot, setSnapshot } = pollInfo;
  const { sheet } = useContext(SheetEditorContext);

  const [drawer, _setDrawer] = useState('');
  const setDrawer = (nextDrawer) => {
    if (!!snapshot) setSnapshot(null) // prevent persisting 'download' between drawers, a better solution exists, this is temp solution
    _setDrawer(nextDrawer)
  }
  
  const toggleDrawers = (drawerName) => {
    if (!drawerName || drawer === drawerName) return setDrawer('');
    return setDrawer(drawerName)
  }

  useHotkeys('ctrl+f, cmd+f', (e) => {
    e.preventDefault();
    toggleDrawers('search');
  });

  // useHotkeys('ctrl+z, cmd+z', undo);
  // useHotkeys('ctrl+shift+z, cmd+shift+z', redo);
  // useHotkeys('ctrl+c, cmd+c', copy, [selectedShapes]);
  // useHotkeys('ctrl+v, cmd+v', paste);

  const [containerSize, setContainerSize] = useState(null);
  const _container = useRef(null)

  const updateContainerSize = () => {
    const clientRect = _container.current.getBoundingClientRect()
    if (!containerSize || clientRect.width !== containerSize.width || clientRect.height !== containerSize.height || clientRect.x !== containerSize.x || clientRect.y !== containerSize.y) {
      setContainerSize({ 
        x: clientRect.x, 
        y: clientRect.y, 
        width: clientRect.width,
        height: clientRect.height 
      })
    }
  }

  const containerRef = (ref) => {
    if (ref) {
      _container.current = ref
      updateContainerSize();
    }
  }

  const _listener = useRef(_.debounce(updateContainerSize, 500)).current
  useEffect(() => { 
    window.addEventListener('resize', _listener)
    
    return () => { window.removeEventListener('resize', _listener) }
  }, [])

  return (
    <div className="flex h-full">
      <FileDrawer />
      {/* <Subheader
        key={sheet?.id || 'no-sheet'}
        drawer={drawer}
        toggleDrawers={toggleDrawers}
      /> */}
      <section ref={containerRef} id="container" className="relative flex-1">
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Dropzone */}
          {sheet ? (
            // <Dropzone />
            <div>Dropzone</div>
          ) : (containerSize && !sheet && (
            <CanvasWorld
              containerSize={containerSize}
              drawer={drawer}
              toggleDrawers={toggleDrawers}
            />
          ))}
        </div>
      </section>
    </div>
  )
}