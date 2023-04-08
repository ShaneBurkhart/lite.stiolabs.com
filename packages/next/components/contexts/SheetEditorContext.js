import React, { useRef, useState, useContext, useEffect } from "react";
import _ from 'underscore';
const uuid = require("uuid").v4;

// import { useParams, useHistory } from 'react-router-dom';
// import { annotationHexNums as hexNums } from "gmi-annotation-tool/dist/canvas-react/config/colors";
// import { shapeClasses } from "gmi-annotation-tool/dist/canvas-react/config/shapes";
// import { getSnapshotPresignedUrl, startSnapshotExportLambda, uploadSnapshotFile } from '../../util/awsPresign';
// import { serialize, deserialize } from "gmi-annotation-tool";
// import { useDevConsole } from "gmi-utils";

// import { get, put, post, $delete } from '../../util/axios.js';

// import { AuthContext } from 'shared/contexts/AuthContext';
// import { TasksContext } from './TasksContext';
// import { ProjectContext } from './ProjectContext';
// import { FeedbackContext } from "shared/contexts/FeedbackContext";

// const { logSuccess, logError } = useDevConsole();

export const SheetEditorContext = React.createContext({
  // textSearchMatches: [],
  sheet: null,
  // sheets: [],
  // recentSheets: [],
  // filters: {},
  // pollInfo: {},
  // allShapes: [],
  // visibleShapes: [],
  // selectedShapes: [],
  // selectedShape: null,
  // textSearchQuery: '',
  // detectedText: null,
  // detectedFullPageText: null,

  // setTextSearchMatches: () => {},
  // setSheet: () => {},
  // setAllShapes: () => {},
  // setSelectedShapes: () => {},
  // setTextSearchQuery: () => {},


  // _createAnnotation: () => {},
  // _updateAnnotations: () => {},
  // _deleteAnnotations: () => {},
  // _publishAnnotation: () => {},
  // _unpublishAnnotation: () => {},
  // updateAnnotationFromTask: () => {},
});

export const SheetEditorContextProvider = ({ children }) => {
  // const history = useHistory();
  // const { project_access_token, sheetId } = useParams();
  
  // const { user } = useContext(AuthContext);
  const user = { id: 1 };
  // const { createTasks } = useContext(TasksContext);
  // const { project, annotations, setAnnotations, allStamps } = useContext(ProjectContext);
  // const { showErrorToast } = useContext(FeedbackContext);
  
  const [snapshot, setSnapshot] = useState(null);
  const [pipelineDidComplete, setPipelineDidComplete] = useState(false);
  const [pipelineDidTimeout, setPipelineDidTimeout] = useState(false);
  
  const [allShapes, _setAllShapes] = useState([]);
  const [_selectedShapes, setSelectedShapes] = useState([]);
  const [textSearchQuery, setTextSearchQuery] = useState('');
  const [textSearchMatches, setTextSearchMatches] = useState([]);
  
  const [colorFilters, setColorFilters] = useState([]);
  const [shapeFilters, setShapeFilters] = useState([]);
  const [publishedFilters, setPublishedFilters] = useState([]);

  const [detectedText, setDetectedText] = useState(null);
  const [detectedFullPageText, setDetectedFullPageText] = useState(null);
  
  const _allShapes = useRef([]);
  const _initialShapes = useRef({});

  const [recentSheets, _setRecentSheets] = useState([]);
  
  const getInitialShape = shapeId => _initialShapes.current[shapeId];
  const getCurrentShape = shapeId => _allShapes.current.find(s => s.id === shapeId);
  const getAllShapesCurrent = () => _allShapes.current;

  const setAllShapes = (allShapes) => {
    _allShapes.current = allShapes
    _setAllShapes(allShapes)
  }

  // const sheets = project.Sheets || [];
  // const sheet = sheets.find(s => s.id === sheetId);

  const sheet = null;
  // const sheet = {
  //   id: 1,
  //   width: 7200,
  //   height: 3600,
  // }
  
  const setSheet = (_sheet) => history.push(`/projects/${project_access_token}/dashboard/sheets/edit/${_sheet.id}`);
  
  const userShouldSee = a => a.published || a.userId === user.id;
  const annotations = [];
  const sheetAnnotations = annotations.filter(a => a.sheetId === sheetId && userShouldSee(a));


  // useEffect(() => {
  //   const __allShapes = sheetAnnotations.map(a => deserialize(a, project)).filter(result => !!result); // .filter b/c if shape constructor not found, it returns false -- .filter can probably be removed when we get a better pattern going
  //   setAllShapes(__allShapes);

  //   if (__allShapes.length && _.isEmpty(_initialShapes.current)) {
  //     _initialShapes.current = Object.fromEntries(sheetAnnotations.map(a => [a.id, { ...a }]));
  //   }
  // }, [project, sheetId]);

  useEffect(() => {
    if (!sheet) return;

    // // add to recent sheets
    // const recentSheetIndex = recentSheets.findIndex(recentSheet => recentSheet.id === sheet.id);
    // if (recentSheetIndex === -1) _setRecentSheets([sheet, ...recentSheets]);

    // get(sheet.textExtractDataUrl, (detectedText) => {
    //   setDetectedText(detectedText)
    // }, (error) => console.log(error))

    // get(sheet.textDetectFullPageUrl, (detectedFullPageText) => {
    //   if (!detectedFullPageText) return;

    //   const fullPageText = JSON.parse(detectedFullPageText["All Text"])
    //   setDetectedFullPageText(fullPageText)
    // }, (error) => console.log(error))
  }, [sheet])


  /* 
    RENDER-TIME FILTER AND STATE COMPUTATIONS
  */ 

  // const _currentColors = allShapes.map(s => s.color);
  // const _currentColorsReduced = [ ...new Set(_currentColors) ];
  // const computedColorFilters = hexNums.filter(h => colorFilters.includes(h) && _currentColors.includes(h));
  // 
  // const _currentShapes = allShapes.map(s => s.constructorName);
  // const _currentShapesReduced = [ ...new Set(_currentShapes) ];
  // const computedShapeFilters = shapeClasses.filter(s => shapeFilters.includes(s) && _currentShapes.includes(s));
  
  // let visibleShapes = [ ...allShapes ];
  // if (computedColorFilters.length) visibleShapes = visibleShapes.filter(s => !computedColorFilters.includes(s.color));
  // if (computedShapeFilters.length) visibleShapes = visibleShapes.filter(s => !computedShapeFilters.includes(s.constructorName));
  // if (publishedFilters.length) visibleShapes = visibleShapes.filter(s => { 
    // if (publishedFilters.includes('published') && !!s.published) return false;
    // if (publishedFilters.includes('unpublished') && !s.published) return false;
    // return true;
  // });

  const resetFilters = () => {
    setShapeFilters([]);
    setColorFilters([]);
    setPublishedFilters([]);
  }
  
  const _publishedOptions = ['published', 'unpublished']; // there's probably better way for bool based filter count (?)
  // const totalFilterCount = _currentColorsReduced.length + _currentShapesReduced.length + _publishedOptions.length;
  // const selectedFilterCount = computedShapeFilters.length + computedColorFilters.length + publishedFilters.length;
  // as more filters are added we'll need to add their possible count here or find another way to derive

  const filters = {
    // count: selectedFilterCount,
    // totalCount: totalFilterCount,
    // _currentColors,
    // _currentShapes,
    colorFilters,
    shapeFilters,
    publishedFilters,
    resetFilters,
    setColorFilters,
    setShapeFilters,
    setPublishedFilters,
  }


  /*
    DOWNLOAD & EXPORT FUNCS
  */

  const pollInfo = {
    snapshot,
    setSnapshot,
    pipelineDidTimeout,
    pipelineDidComplete,
  }

  /*
     API ACTIONS
  */
  // TODO: use success/error callbacks, revisit setAllShapes/setAnnotations patterns
  // const endpointRoot = `/api/sheets/${project_access_token}/annotation`;
  
  const _createAnnotation = (newShape) => {
    if (newShape.constructorName === "StampShape") {
      const { stampKey } = newShape;
      const { key, title } = allStamps.find(s => (s.key || '').toLowerCase() === (stampKey || '').toLowerCase()) || {};
      const newTask = {
        id: uuid(),
        stamp: { key, title },
        sheetId,
        title: title || '',
      }

      newShape.taskId = newTask.id;
      createTasks([newTask])
    }

    const raw = serialize(newShape);
    const form = {
      id: raw.id,
      sheetId,
      type: newShape.constructorName || '',
      shapeData: raw.shapeData,
      published: false,
    };
    
    const onSuccess = (s) => logSuccess(s);
    const onError = (e) => logError(e);
    
    post(endpointRoot, form, onSuccess, onError);
    
    const nextAllShapes = _allShapes.current.filter(s => s.id !== newShape.id);
    setAllShapes([ ...nextAllShapes, newShape ]);
    
    setAnnotations([ ...annotations, { ...form, userId: user.id } ]);
  };
  
  const _updateAnnotations = (shapes, onSuccess=null, onError=null) => {
    let updatedAnnotations = [ ...annotations ];
    
    shapes.forEach((shape, i) => {
      const isLast = i === shapes.length - 1;

      const raw = serialize(shape);
      
      const form = { shapeData: raw.shapeData };

      updatedAnnotations = updatedAnnotations.map(a => (a.id === shape.id ? { ...a, ...form} : a));
      
      const _onSuccess = (s) => { logSuccess(s); if (isLast && !!onSuccess) onSuccess()}
      const _onError = (e) => { logError(e); if (isLast && !!onError) onError()}
      
      put(`${endpointRoot}/${shape.id}`, form, _onSuccess, _onError)
    })
    
    setAnnotations(updatedAnnotations)
  };

  const updateAnnotationFromTask = ({ taskId, stampId }) => {
    const shapeToUpdate = _allShapes.current.find(s => s.taskId === taskId);
    if (!shapeToUpdate) return;

    shapeToUpdate.stampId = stampId;

    _updateAnnotations([shapeToUpdate]);
  }

  const _deleteAnnotations = (shapes) => {
    let updatedAnnotations = [ ...annotations ];
    let updatedAllShapes = [ ..._allShapes.current ];

    shapes.forEach(shape => {
      const form = {};
      
      const onSuccess = (s) => logSuccess(s)
      const onError = (e) => logError(e)
      
      $delete(`${endpointRoot}/${shape.id}`, form, onSuccess, onError);

      updatedAnnotations = updatedAnnotations.filter(a => a.id !== shape.id);
      updatedAllShapes = updatedAllShapes.filter(s => s.id !== shape.id)
    })

    setAllShapes(updatedAllShapes)
    setAnnotations(updatedAnnotations)
  };

  const togglePublishAnnotation = ({ endpoint, shouldPublish, shape }, onSuccess=null, onError=null) => {
    const form = {};
    const _onSuccess = (s) => {if (onSuccess) onSuccess()};
    const _onError = (e) => {if (onError) onError()};
    
    put(endpoint, form, _onSuccess, _onError);
    
    shape.published = shouldPublish;
    setAllShapes([ ..._allShapes.current ]);
    
    form.published = shouldPublish;
    setAnnotations(annotations.map(a => (a.id === shape.id ? { ...a, ...form} : a)));
  }
  
  const _publishAnnotation = (shape, onSuccess, onError) => {
    togglePublishAnnotation({ endpoint: `${endpointRoot}/${shape.id}/publish`, shouldPublish: true, shape }, onSuccess, onError);
  };
  
  
  const _unpublishAnnotation = (shape, onSuccess, onError) => {
    togglePublishAnnotation({ endpoint: `${endpointRoot}/${shape.id}/unpublish`, shouldPublish: false, shape }, onSuccess, onError);
  };

  const visibleShapes = []
  const visibleShapesMap = Object.fromEntries(visibleShapes.map(s => [s.id, s]));
  const selectedShapeIds = _selectedShapes.filter(s => !!visibleShapesMap[s.id]).map(s => s.id);
  const selectedShapes = allShapes.filter(s => selectedShapeIds.includes(s.id));
  const selectedShape = selectedShapes.length === 1 ? selectedShapes[0] : null;
  const sheets = [];

  const contextVal = {
    textSearchMatches,
    sheet,
    sheets,
    recentSheets,
    filters,
    pollInfo,
    allShapes,
    visibleShapes,
    selectedShapes,
    selectedShape,
    textSearchQuery,
    detectedText,
    detectedFullPageText,

    setTextSearchMatches,
    setSheet,
    setAllShapes,
    setSelectedShapes,
    setTextSearchQuery,

    // exportPDF,
    // exportImage,

    getInitialShape,
    getCurrentShape,
    getAllShapesCurrent,

    _createAnnotation,
    _updateAnnotations,
    _deleteAnnotations,
    _publishAnnotation,
    _unpublishAnnotation,
    updateAnnotationFromTask,
  };

  return (
    <SheetEditorContext.Provider value={contextVal}>
      {children}
    </SheetEditorContext.Provider>
  );
};
