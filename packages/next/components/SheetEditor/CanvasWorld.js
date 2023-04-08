import React, { useContext, useState, useRef, useEffect, Suspense } from 'react';
// import { drawerShapes, drawerKeys as shapeDrawers } from "gmi-annotation-tool/dist/canvas-react/config/shapes";
import _ from "underscore";
// import { FullContainerLoadingSpinner } from 'shared/components/LoadingSpinner';

// import { UndoRedoContext } from 'project/contexts/UndoRedoContext';
import { SheetEditorContext } from '../contexts/SheetEditorContext';

import WebGLCanvas from './WebGLCanvas';
import ShapeComponents from './ThreeComponents';

import RightControls from './RightControls';
import CenterControls from './CenterControls';
// import BottomControls from './BottomControls';
// import { DrawerTransition } from './Drawer/DrawerWrapper';
// import { ShapeDrawer, FiltersDrawer, SheetInfoDrawer, DownloadDrawer, ExportDrawer, SearchDrawer } from './Drawer';

// import { AnnotationWorkspace } from "gmi-annotation-tool";

const CanvasWorld = ({ containerSize, drawer, toggleDrawers }) => {
  const {
    textSearchMatches,
    sheets: allSheets,
    allShapes,
    visibleShapes,
    selectedShapes,
    detectedText,
    detectedFullPageText,
    selectedShape,
    setSheet,
    setAllShapes,
    setSelectedShapes,
  } = useContext(SheetEditorContext);

  const sheet = {
    "id": "22820ba9-c539-46ad-a167-75e2200bb717",
    "dpi": "150",
    "num": "E2-508N. TF1",
    "name": "LIGHTING FLOOR PLAN",
    "tags": [
        "electrical"
    ],
    "width": "6300",
    "height": "4500",
    "pdfUrl": "https://gmi-central-n.s3.amazonaws.com/documents/92fe4514-b207-4bd7-8ca1-5567215d46f0_0.pdf",
    "pageIndex": 0,
    "planSetId": "92fe4514-b207-4bd7-8ca1-5567215d46f0",
    "fullImgUrl": "https://gmi-central-n.s3.amazonaws.com/documents/22820ba9-c539-46ad-a167-75e2200bb717.png",
    "VersionSetId": "669750d0-7c9b-4724-9545-342024cc2628",
    "planSetS3Url": "https://gmi-central-n.s3.amazonaws.com/documents/113583d8-1c17-43b8-93d7-9188483d114c_E2-508N.TF1-LIGHTING-FLOOR-PLAN--LEVEL-08-NORTH-Rev.5.pdf",
    "thumbnailUrl": "https://gmi-central-n.s3.amazonaws.com/documents/22820ba9-c539-46ad-a167-75e2200bb717_thumbnail.png",
    "planSetFilename": "E2-508N.TF1-LIGHTING-FLOOR-PLAN--LEVEL-08-NORTH-Rev.5.pdf",
    "textExtractDataUrl": "https://gmi-central-n.s3.amazonaws.com/text-extract/22820ba9-c539-46ad-a167-75e2200bb717/compiled.json"
  }

  // const {
  //   createAnnotation,
  //   updateAnnotations,
  //   deleteAnnotations,
  //   publishAnnotation,
  //   unpublishAnnotation,
  // } = useContext(UndoRedoContext);

  const [shapeBeingDrawn, setShapeBeingDrawn] = useState(null);
	const [selectedTool, _setSelectedTool] = useState("select");
	const [selectedColor, _setSelectedColor] = useState(0xFF0000);
	const [selectedStampKey, setSelectedStampKey] = useState('');
  const [mapPos, setMapPos] = useState({ scale: 1, translation: { x: 0, y: 0 } });
	
	const _webglCanvas = useRef(null);
	const _containerEl = useRef(null);
	const _shapeBeingDragged = useRef(null);

  // const __annotationWorkspace = useRef(new AnnotationWorkspace());
  const __annotationWorkspace = useRef(new Object());
  const _annotationWorkspace = __annotationWorkspace.current;

  const calibrationShape = allShapes.find(s => s.constructorName === 'CalibrationShape');
  const calibrationScale = calibrationShape ? calibrationShape.calculateUnitScale() : 0;
  const hasCalibration = !!calibrationShape;

  const setSelectedTool = (newSelectedTool, clearSelectedShapes=true) => {
    if (clearSelectedShapes) setSelectedShapes([]);
    if (shapeDrawers[drawer]) toggleDrawers();
  
		_setSelectedTool(newSelectedTool);
  }

  const setSelectedColor = (newSelectedColor) => {
    let shapesToChange = selectedShapes.filter(s => s.color !== newSelectedColor);
    if (!!shapesToChange.length) {
      shapesToChange.forEach(s => s.color = newSelectedColor);
      updateAnnotations(shapesToChange);
    }
    if (newSelectedColor === selectedColor) return;
    _setSelectedColor(newSelectedColor);
  }

  const handleSetSelectedShapes = (shapes) => {
    if (shapes.length !== 1 && !!shapeDrawers[drawer]) toggleDrawers(); //TODO: prevents drawer from staying open when lasso is being drawn to more than one shape, should revisit this later

    if (shapes.length === 1) {
      const shapeName = shapes[0].constructorName;
      const shapeColor = shapes[0].color;
      
      if (!!drawerShapes[shapeName]){
        if (drawer !== drawerShapes[shapeName].key) toggleDrawers(drawerShapes[shapeName].key);
      } else if (shapeDrawers[drawer]) {
        toggleDrawers();
      }

      if (shapeColor !== selectedColor) _setSelectedColor(shapeColor);
    }

    setSelectedShapes(shapes);
  }

  const publishSelectedAnnotation = (onSuccess, onError) => {
    if (!selectedShapes || selectedShapes.length !== 1) return onError ? onError() : null;

    publishAnnotation(selectedShapes[0], onSuccess, onError);
  }

  const unpublishSelectedAnnotation = (onSuccess, onError) => {
    if (!selectedShapes || selectedShapes.length !== 1) return onError ? onError() : null;

    unpublishAnnotation(selectedShapes[0], onSuccess, onError);
  }

  const deleteSelectedAnnotation = () => {
    if (!selectedShapes || selectedShapes.length !== 1) return
    const shapeName = selectedShape?.constructorName;
    if (drawerShapes[shapeName] && drawer === drawerShapes[shapeName].key) toggleDrawers();
    
    deleteAnnotations([ selectedShapes[0] ]);
  }

  const justOver = (width, height, desiredWidth, desiredHeight) => {
    if (width/ 2 <= desiredWidth || height / 2 <= desiredHeight) return { width, height }
    return justOver(width / 2, height / 2, desiredWidth, desiredHeight);
  }

  const sheetWidth = parseInt(sheet.width, 10);
  const sheetHeight = parseInt(sheet.height, 10);
  const { width, height } = sheet ? justOver(sheetWidth, sheetHeight, containerSize.width, containerSize.height) : 100;

  const imageWidth = width;
  const imageHeight = height;

  const fitPageToScreen = () => {
    // set scale large and it will dynamically adjust
    setStage(sheetWidth / 2, sheetHeight / 2, 1000000);
  }


  useEffect(_ => {
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehaviorX = "none";

      return _ => { 
        document.body.style.overflow = "auto" 
        document.body.style.overscrollBehaviorX = "auto";
      }
  }, [])

  useEffect(() => { fitPageToScreen() }, [containerSize])

  const getMaxScale = () => {
    return Math.max(sheetWidth / containerSize.width, sheetHeight / containerSize.height) * 1.1;
  }
  
  const setStageScale = (scale, x, y) => {
    const maxScale = getMaxScale();
    const newMap = { ...mapPos, scale: Math.min(Math.max(scale, 0.50), maxScale) };
    if (x !== undefined && y !== undefined && scale === newMap.scale) {
      newMap.translation.x = Math.min(Math.max(x, 0), sheetWidth)
      newMap.translation.y = Math.min(Math.max(y, 0), sheetHeight)
    }
    setStage(newMap.translation.x, newMap.translation.y, newMap.scale);
  }

  const setStagePos = (x, y) => { setStage(x, y, mapPos.scale) }

  const setStage = (x, y, scale) => {
    const maxScale = getMaxScale();
    setMapPos({ 
      ...mapPos, 
      translation: {
        x: Math.min(Math.max(x, 0), sheetWidth),
        y: Math.min(Math.max(y, 0), sheetHeight),
      },
      scale: Math.min(Math.max(scale, 0.50), maxScale)
    })
  }

  
  const handlers = {
    // onMouseDown: (e) => _annotationWorkspace.onMouseDown(e),
    // onMouseMove: (e) => _annotationWorkspace.onMouseMove(e),
    // onMouseUp: (e) => _annotationWorkspace.onMouseUp(e),
    // onMouseLeave: (e) => _annotationWorkspace.onMouseLeave(e),
    // onTouchStart: (e) => _annotationWorkspace.onTouchStart(e),
    // onTouchMove: (e) => _annotationWorkspace.onTouchMove(e),
    // onTouchEnd: (e) => _annotationWorkspace.onTouchEnd(e),
    // onKeyDown: (e) => {_annotationWorkspace.onKeyUp(e)},
  }

  const initCanvas = (ref) => {
    if (!ref || _webglCanvas.current === ref) return;
    if (ref) _webglCanvas.current = ref;

    console.log("INIT CANVAS", sheetWidth, sheetHeight)
  }

  const renderWorkspace = () => {
    console.log("RENDERING WORKSPACE")

  //   __annotationWorkspace.current.render({
  //     textSearchMatches,
  //     sheet, 
  //     allShapes,
  //     allSheets,
  //     visibleShapes,
  //     selectedShapes, 
  //     selectedColor,
  //     selectedStampKey,
  //     selectedTool, 
  //     detectedText,
  //     detectedFullPageText,
  //     mapPos,
  //     containerSize,
  //     canvasSize: { width: sheetWidth, height: sheetHeight },
  //     isNative: false,
  //     setSheet,
  //     createText: (message, style) => { return new Text(message, style) },
  //     createGraphics: () => { return null },
  //     setCursor: (cursor) => { if (_containerEl.current) _containerEl.current.style.cursor = cursor },
  //     getCursor: () => { if (_containerEl.current) _containerEl.current.style.cursor },
  //     setShapeBeingDrawn: (shape) => { setShapeBeingDrawn(shape) },
  //     setShapeBeingDragged: (shape) => { _shapeBeingDragged.current = shape },
  //     setAllShapes,
  //     setSelectedShapes: handleSetSelectedShapes,
  //     onShapeCreated: (newShape) => {
  //       const shapeName = newShape.constructorName;
  //       const shouldSwitchToSelectionTool = ["CalibrationShape", "TextShape", "StampShape"].includes(shapeName);
  //       createAnnotation(newShape);
    
  //       if (shouldSwitchToSelectionTool) {
  //         setSelectedTool('select');
          
  //         if (drawerShapes[shapeName]) {
  //           handleSetSelectedShapes([newShape]);
  //           if (drawerShapes[shapeName].key !== drawer) toggleDrawers(drawerShapes[shapeName].key);
  //         }
  //       }
  //     },
  //     onShapeUpdating: (newShape) => { },
  //     onShapesUpdated: (newShapes) => { updateAnnotations([...newShapes]) },
  //     deleteAnnotations
  //   })
  }

  renderWorkspace();
	
  // const shapeDrawerProps = { selectedShape, selectedShapes, sheet, publishSelectedAnnotation, unpublishSelectedAnnotation, deleteSelectedAnnotation, updateAnnotations }

  return (
    <div className="relative h-full" ref={_containerEl}>
      <RightControls
        // drawerIsOpen={!!drawer}
        // hasCalibration={hasCalibration}
        // selectedTool={selectedTool}
        // selectedColor={selectedColor}
        // selectedStampKey={selectedStampKey}
        // setSelectedTool={setSelectedTool}
        // setSelectedColor={setSelectedColor}
        // setSelectedStampKey={setSelectedStampKey}
      />
      {/* <LeftControls /> */}
      {/* <BottomControls /> */}
      <CenterControls />
      <Suspense fallback={<div />}>
        <WebGLCanvas 
          sheet={sheet}
          mapPos={mapPos}
          initCanvas={initCanvas}
          setStagePos={setStagePos}
          setStageScale={setStageScale}
          containerSize={containerSize}
          handlers={handlers}
          canPanAndZoom={() => !_shapeBeingDragged.current && selectedTool !== 'multiSelect'}
          onClick={e => {
            if (e.target.nodeName === "DIV" && !!selectedShapes.length) { handleSetSelectedShapes([]) }
          }}
          onMouseUp={e => {
            _shapeBeingDragged.current = null 
          }}
          onTouchEnd={e => {
            _shapeBeingDragged.current = null 
          }}
        >
          <ShapeComponents
            {...{shapeBeingDrawn, detectedText, detectedFullPageText, containerSize, sheet, selectedShapes, visibleShapes, calibrationScale, allSheets, textSearchMatches }}
          />
        </WebGLCanvas>
      </Suspense>


      {/* <DrawerTransition show={!!drawer}>
        {!!shapeDrawers[drawer] && <ShapeDrawer key={(selectedShape || {}).id || '_'} title={shapeDrawers[drawer].title} onClose={toggleDrawers} {...shapeDrawerProps}  />}
        {drawer === 'search' && <SearchDrawer onClose={toggleDrawers}  toggleDrawers={toggleDrawers} />}
        {drawer === 'export' && <ExportDrawer onClose={toggleDrawers}  toggleDrawers={toggleDrawers} />}
        {drawer === 'filters' && <FiltersDrawer sheet={sheet} onClose={toggleDrawers} />}
        {drawer === 'download' && <DownloadDrawer sheet={sheet} onClose={toggleDrawers} toggleDrawers={toggleDrawers} />}
        {drawer === 'sheetInfo' && <SheetInfoDrawer sheet={sheet} onClose={toggleDrawers} />}
      </DrawerTransition> */}
    </div>
  )
}

export default CanvasWorld;