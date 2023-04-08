import React, { useRef, useContext } from "react";
import { useParams } from 'react-router-dom';
import { ProjectContext } from './ProjectContext';
import { SheetEditorContext } from './SheetEditorContext';
import { serializeForUndo, deserialize } from 'gmi-annotation-tool';

const actionTypes = {
  CREATE: 'create',
  DESTROY: 'destroy',
  UPDATE: 'update',
  PUBLISH: 'publish',
  UNPUBLISH: 'unpublish',
}

const { CREATE, DESTROY, PUBLISH, UNPUBLISH, UPDATE } = actionTypes;

export const UndoRedoContext = React.createContext({
  undo: () => {},
  redo: () => {},
  getUndoDisabled: () => {},
  getRedoDisabled: () => {},
  createAnnotation: () => {},
  createAnnotations: () => {},
  updateAnnotations: () => {},
  deleteAnnotations: () => {},
  publishAnnotation: () => {},
  unpublishAnnotation: () => {},
});


export const UndoRedoContextProvider = ({ children }) => {
  const { project } = useContext(ProjectContext);
  const {
    setAllShapes,
    getInitialShape,
    getCurrentShape,
    getAllShapesCurrent,
    _createAnnotation,
    _updateAnnotations,
    _deleteAnnotations,
    _publishAnnotation,
    _unpublishAnnotation,
  } = useContext(SheetEditorContext);

  const { sheetId } = useParams();
  const _serializeForUndo = shapeArr => serializeForUndo(shapeArr, sheetId);
  const _deserialize = shape => deserialize(shape, project); 

  const _undoQueue = useRef([]).current;
  const _redoQueue = useRef([]).current;

  const pushToUndoQueue = ({ type, data }) => _undoQueue.push({ type, data });
  const clearRedoQueue = () => _redoQueue.length = 0;

  const createAnnotation = (newShape) => {
    pushToUndoQueue({ type: CREATE, data: [ _serializeForUndo(newShape) ] });
    clearRedoQueue();

    _createAnnotation(newShape);
  }

  const createAnnotations = (newShapes) => { //TODO: this is for undoing shape creation via ctrl+c but maybe all annotations crud api should be array based anyway
    const serializedShapes = newShapes.map(s => _serializeForUndo(s));
    pushToUndoQueue({ type: CREATE, data: serializedShapes });
    clearRedoQueue();

    newShapes.forEach(shape => _createAnnotation(shape));
  }

  const deleteAnnotations = (shapes) => {
    const serializedShapes = shapes.map(s => _serializeForUndo(s));
    pushToUndoQueue({ type: DESTROY, data: serializedShapes });
    clearRedoQueue();

    _deleteAnnotations(shapes);
  }

  const updateAnnotations = (shapes, onSuccess, onError) => {
    const serializedShapes = shapes.map(s => _serializeForUndo(s));
    pushToUndoQueue({ type: UPDATE, data: serializedShapes });
    clearRedoQueue();

    _updateAnnotations(shapes, onSuccess, onError);
  }

  const publishAnnotation = (shape, onSuccess, onError) => {
    const serializedShape = _serializeForUndo(shape);
    pushToUndoQueue({ type: PUBLISH, data: [ serializedShape ] });
    clearRedoQueue();

    _publishAnnotation(shape, onSuccess, onError);
  }

  const unpublishAnnotation = (shape, onSuccess, onError) => {
    const serializedShape = _serializeForUndo(shape);
    pushToUndoQueue({ type: UNPUBLISH, data: [ serializedShape ] });
    clearRedoQueue();

    _unpublishAnnotation(shape, onSuccess, onError);
  }

  const findPrevShapeData = shapeId => {
    // look backwards thru _undoQueue for last update/snapshot -- this will be where we reset the shape to
    for (let i = _undoQueue.length - 1; i >= 0; i--) {
      const prevShapeData = _undoQueue[i].data.find(shape => shape.id === shapeId);
      
      if (!!prevShapeData) return prevShapeData;
    }

    // if last update is not in the _undoQueue, get initial state of shape
    const initialShapeData = getInitialShape(shapeId);

    if (!initialShapeData) console.warn(`${shapeId} initial shape not found`); // indicates failure of data structure or data rendering
    return initialShapeData || null;
  }

  const getCurrentShapes = shapeArr => shapeArr.map(s => getCurrentShape(s.id)).filter(s => !!s);

  const updateCurrentShapes = (shapesToUpdate) => {
    const currentShapes = getAllShapesCurrent();

    const nextShapes = currentShapes.map(shape => {
      const updatedShape = shapesToUpdate.find(_s => _s.id === shape.id);
      return updatedShape || shape;
    });

    // update ref (source of truth) & state (to trigger re-renders)
    setAllShapes(nextShapes);
  }

  const getPrevShapes = shapesArr => {
    return shapesArr.map(shape => {
      const prevShapeData = findPrevShapeData(shape.id);
      return _deserialize(prevShapeData) || null;
    }).filter(s => !!s);
  }

  const undoActions = {
    [CREATE]: (shapesArr) => {
      // find current shape instances and send to delete method -- I don't think I need to recreate ptArr coords from snapshot (?)
      const shapesToDelete = getCurrentShapes(shapesArr);
      _deleteAnnotations(shapesToDelete);
    },
    [DESTROY]: (shapesArr) => {
      // create the shapes again from serialized data
      const shapesToCreate = shapesArr.map(s => _deserialize(s))
      shapesToCreate.forEach(shape => _createAnnotation(shape));
    },
    [UPDATE]: (shapesArr) => {
      // get prev snapshots
      const shapesToUndo = getPrevShapes(shapesArr);

      // update ref & state w/ prev snapshots
      updateCurrentShapes(shapesToUndo);

      // persist to project events
      _updateAnnotations(shapesToUndo);
    },
    [PUBLISH]: (shapesArr) => {
      // get prev snapshot
      // it is important to render the ptArray coords from which 'publish'/'unpublish' were called
      const shapesToUnpublish = getPrevShapes(shapesArr);

      // update ref & state
      updateCurrentShapes(shapesToUnpublish);

      // persist to project events
      shapesToUnpublish.forEach(s => _unpublishAnnotation(s));
    },
    [UNPUBLISH]: (shapesArr) => {
      // get prev snapshot
      const shapesToPublish = getPrevShapes(shapesArr);

      // update ref & state
      updateCurrentShapes(shapesToPublish);

      // persist to project events
      shapesToPublish.forEach(s => _publishAnnotation(s));
    },
  }

  const redoActions = {
    [CREATE]: (shapesArr) => {
      // create shape again from serialized data
      const shapesToCreate = shapesArr.map(s => _deserialize(s));
      shapesToCreate.forEach(shape => _createAnnotation(shape));
    },
    [DESTROY]: (shapesArr) => {
      // find current instances of shapesArr and send to delete method
      const shapesToDelete = getCurrentShapes(shapesArr);
      _deleteAnnotations(shapesToDelete)
    },
    [UPDATE]: (shapesArr) => {
      // recreate instances from serialized data
      const shapesToRedo = shapesArr.map(shape => _deserialize(shape)).filter(s => !!s);

      // update ref & state
      updateCurrentShapes(shapesToRedo);

      // persist to project events
      _updateAnnotations(shapesToRedo);
    },
    [PUBLISH]: (shapesArr) => {
      const shapesToPublish = shapesArr.map(s => _deserialize(s)).filter(s => !!s);

      updateCurrentShapes(shapesToPublish);
      
      shapesToPublish.forEach(shape => _publishAnnotation(shape));
    },
    [UNPUBLISH]: (shapesArr) => {
      const shapesToUnpublish = shapesArr.map(s => _deserialize(s)).filter(s => !!s);

      updateCurrentShapes(shapesToUnpublish);
      
      shapesToUnpublish.forEach(shape => _unpublishAnnotation(shape));
    },
  }

  const undo = () =>  {
    if (!_undoQueue.length) return;
  
    const actionToUndo = _undoQueue.pop();
    const { type, data } = actionToUndo;

    undoActions[type](data);
    _redoQueue.push(actionToUndo)
  }

  const redo = () =>  {
    if (!_redoQueue.length) return;

    const actionToRedo = _redoQueue.pop();
    const { type, data } = actionToRedo;
    redoActions[type](data);

    _undoQueue.push(actionToRedo);
  }

  const getUndoDisabled = () => !_undoQueue.length;
  const getRedoDisabled = () => !_redoQueue.length;


  const contextVal = {
    undo,
    redo,
    getUndoDisabled,
    getRedoDisabled,
    createAnnotation,
    createAnnotations,
    updateAnnotations,
    deleteAnnotations,
    publishAnnotation,
    unpublishAnnotation,
  }

  return (
    <UndoRedoContext.Provider value={contextVal}>
      {children}
    </UndoRedoContext.Provider>
  );
};
