import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
// import { getDesaturated } from "gmi-annotation-tool/dist/canvas-react/config/colors";
import _ from "underscore";
// import { getSheetCalloutShapes } from "gmi-annotation-tool";
// import { getTextSearchShapes } from "gmi-annotation-tool";

import { extend, Canvas, useThree, useFrame, useLoader, } from "@react-three/fiber";
import * as THREE from "three";
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "three.meshline";

extend({ MeshLine, MeshLineMaterial, MeshLineRaycast });
const { TextureLoader, LinearFilter, ClampToEdgeWrapping } = THREE;

// import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
// extend({ TextGeometry });

import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import OpenSans from "../../fonts/Open Sans_Regular.json";

import ArrowShape from './shapes/ArrowShape';
import CameraShape from './shapes/CameraShape';
import CalibrationShape from './shapes/CalibrationShape';
import CircleShape from './shapes/CircleShape';
import CircleLinkShape from './shapes/CircleLinkShape';
import CloudLinkShape from "./shapes/CloudLinkShape";
import CloudShape from './shapes/CloudShape';
import CrossShape from './shapes/CrossShape';
import LineShape from './shapes/LineShape';
import LineLengthShape from './shapes/LineLengthShape';
import HighlightShape from './shapes/HighlightShape';
import RectangleShape from './shapes/RectangleShape';
import RectangleLinkShape from './shapes/RectangleLinkShape';
import RectangleAreaShape from './shapes/RectangleAreaShape';
import PenShape from './shapes/PenShape';
import StampShape from './shapes/StampShape';
import SplineAreaShape from './shapes/SplineAreaShape';
import SplineLengthShape from './shapes/SplineLengthShape';
import TextShape from './shapes/TextShape';


export const SHAPE_COMPONENTS = {
	LineShape,
	ArrowShape,
	RectangleShape,
	CrossShape,
	CircleShape,
	CloudShape,
	PenShape,
	HighlightShape,
	TextShape,
	RectangleLinkShape,
	CircleLinkShape,
	CloudLinkShape,
	StampShape,
	CameraShape,
	CalibrationShape,
	LineLengthShape,
	SplineAreaShape,
	SplineLengthShape,
	RectangleAreaShape,
	CalloutShape: RectangleLinkShape,
	TextSearchShape: RectangleShape,
}

const FPS = 60;

const ShapeComponents  = React.memo(function ShapeComponents (props) {
	const { detectedText, textSearchMatches, sheet, selectedShapes, visibleShapes, shapeBeingDrawn, calibrationScale, allSheets } = props;
	const _invalidate = useCallback(_.throttle((state) => {
		state.invalidate();
	}, 1000/FPS), [])

	const sheetWidth = parseInt(sheet.width, 10);
	const sheetHeight = parseInt(sheet.height, 10);

	const font = useMemo(() => {
		return new FontLoader().parse(OpenSans);
	}, []);

	useFrame((state) => {
		// if (!!selectedShapes.length || !!shapeBeingDrawn){
			_invalidate(state)
		// }
	})

	const sheetCalloutShapes = useMemo(() => {
		return []
		// return getSheetCalloutShapes(allSheets, detectedText, sheet)
	}, [detectedText, allSheets]);

	const textSearchShapes = useMemo(() => {
		return []
		// return getTextSearchShapes(textSearchMatches)
	}, [textSearchMatches]);

	const shapesToRender = [ ...visibleShapes, ...sheetCalloutShapes, ...textSearchShapes ];
	if (shapeBeingDrawn) shapesToRender.push(shapeBeingDrawn);
	
	const shapeComponents = shapesToRender.reduce((acc, shape) => {
		const Shape = SHAPE_COMPONENTS[shape.constructorName];

		if (!Shape) return acc;

		const selected = !!selectedShapes.find(s => s.id === shape.id);

		acc.push(
			<Shape 
				key={shape.id} 
				font={font}
				shape={shape}
				color={shape.published ? shape.color : getDesaturated(shape.color)}
				selected={selected}
				sheetWidth={sheetWidth} 
				sheetHeight={sheetHeight} 
				calibrationScale={calibrationScale}
			/>
		);  
		return acc;
	}, [])

	return (
		<>{shapeComponents}</>
	);
});

export default ShapeComponents;
