import React, { useRef, useContext } from "react";
import { ProjectContext } from './ProjectContext';
import { SheetEditorContext } from './SheetEditorContext';
import { UndoRedoContext } from './UndoRedoContext';
import { serializeForCopy, deserializeForCopy } from 'gmi-annotation-tool';


export const CopyPasteContext = React.createContext({
  copy: () => {},
  paste: () => {},
});


export const CopyPasteContextProvider = ({ children }) => {
  const { project } = useContext(ProjectContext);
  const { selectedShapes, setSelectedShapes } = useContext(SheetEditorContext);
  const { createAnnotations } = useContext(UndoRedoContext);
  const _copiedShapes = useRef([]).current;

  const copy = () =>  { 
    _copiedShapes.length = 0;
    selectedShapes.forEach(shape => _copiedShapes.push(serializeForCopy(shape)));
  }

  const paste = () =>  {
    const deserializedShapes = _copiedShapes.map(shape => deserializeForCopy(shape, project));
    createAnnotations(deserializedShapes);
    setSelectedShapes(deserializedShapes);
  }

  const contextVal = {
    copy,
    paste,
  }

  return (
    <CopyPasteContext.Provider value={contextVal}>
      {children}
    </CopyPasteContext.Provider>
  );
};
