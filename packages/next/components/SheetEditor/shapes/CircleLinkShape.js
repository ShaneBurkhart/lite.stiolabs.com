import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import _ from "underscore";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import DragHandles from './DragHandles'

import { TEXT_SIZE, getTextOffsets, ptToThreeVector, getWorldPt, containerSize } from "./utils";

const CircleLinkShape = ({ selected, shape, color, sheetWidth, sheetHeight, font }) => {
	const ptArray = shape.poly.ptArray;
	const shapeCenter = useRef(new THREE.Vector3(0,0,0)).current;
	const textOffsetPt = useRef(new THREE.Vector3(0, 0, 0)).current;
	const _line = useRef(null);
	const _text = useRef(null);
	const _curveArea = useRef(null);
	const _prevCenter = useRef(new THREE.Vector3(0,0,0)).current;
	// const _prevPtArray = useRef(ptArray.map(({x,y}) => ({x,y})));

	const getShapeCenter = (pts) => ({
		x: (pts[0].x + pts[1].x + pts[2].x + pts[3].x) / 4,
		y: (pts[0].y + pts[1].y + pts[2].y + pts[3].y) / 4,
	});

	const [ points, curve, curveArea ] = useMemo(() => {
		const points = [0,1,2,3].map(i => (
			ptToThreeVector(ptArray[i], sheetWidth, sheetHeight, containerSize)
		));
		
		const _ctr = getShapeCenter(points);
		shapeCenter.set(_ctr.x, _ctr.y, 0);
		_prevCenter.copy(shapeCenter);
		const radiusX = Math.abs(points[0].x - _ctr.x);
		const radiusY = Math.abs(points[0].y - _ctr.y);
		
		const curve = new THREE.EllipseCurve(
			shapeCenter.x, shapeCenter.y,
			radiusX, radiusY,           
			0,  2 * Math.PI,  
			false, 0                 
		);

		const curveArea = new THREE.Shape();
		curveArea.curves = [];
		curveArea.currentPoint.set(0,0);
		curveArea.absellipse(
			shapeCenter.x, shapeCenter.y,
			radiusX, radiusY,
			0,  2 * Math.PI,
			false, 0
		);
		
		return [points, curve, curveArea];
	}, []);

	const updatePoints = (pts, _ptArray) => {
		[0,1,2,3].forEach((i, idx) => {
			const { x, y } = getWorldPt(_ptArray[i], sheetWidth, sheetHeight, containerSize);
			pts[idx].set(x, y, 0);
		})
	}

	const updateCurveFromPoints = (_curve, pts, _shapeCenter, geometry) => {
		_curve.aX = _shapeCenter.x;
		_curve.aY = _shapeCenter.y;
		_curve.xRadius = Math.abs(pts[0].x - _shapeCenter.x);
		_curve.yRadius = Math.abs(pts[0].y - _shapeCenter.y);
		
		geometry.setFromPoints(_curve.getPoints(50))
	}

	const updateShapeCenter = (_shapeCenter, pts) => {
		const _ctr = getShapeCenter(pts);
		_shapeCenter.set(_ctr.x, _ctr.y, 0);
	}

	// const updatePrevPtArray = (_ptArray) => {
	// 	_prevPtArray.current = _ptArray.map(({x,y}) => ({x,y}));
	// }

	useFrame((state) => {
		if (!shape.needsUpdated) return;
		shape.needsUpdated = false;
		
		updatePoints(points, ptArray);
		
		const prevRadiusX = curve.xRadius || 0.000000001;
		const prevRadiusY = curve.yRadius || 0.000000001;
		
		updateCurveFromPoints(curve, points, shapeCenter, _line.current.geometry);
		updateShapeCenter(shapeCenter, points);
		_text.current.position.set(shapeCenter.x - textOffsetPt.x, shapeCenter.y - textOffsetPt.y, 0);
		
		const _curveAreaPos = _curveArea.current.position;
		// const _linePos = _line.current.position;
		const didResize = prevRadiusX.toFixed(10) !== curve.xRadius.toFixed(10) || prevRadiusY.toFixed(10) !== curve.yRadius.toFixed(10);
		const offsetX = (shapeCenter.x - _prevCenter.x);
		const offsetY = (shapeCenter.y - _prevCenter.y);
		// _curveArea.current.position.set(_curveAreaPos.x + offsetX, _curveAreaPos.y + offsetY);

		if (didResize) {
			// const currentScale = _curveArea.current.scale;
			// const scaleX = curve.xRadius / prevRadiusX * currentScale.x;
			// const scaleY = curve.yRadius / prevRadiusY * currentScale.y;
			// _curveArea.current.scale.set(scaleX, scaleY, 1);
			_curveArea.current.position.set(_curveAreaPos.x + offsetX, _curveAreaPos.y + offsetY);
		} else {
			_curveArea.current.position.set(_curveAreaPos.x + offsetX, _curveAreaPos.y + offsetY);
		}
		
		// updatePrevPtArray(ptArray);
		_prevCenter.set(shapeCenter.x,shapeCenter.y)
	})

  const onUpdateLine = useCallback(self => { self.setFromPoints(curve.getPoints(50)) }, [curve])
	
	const textSize = TEXT_SIZE / sheetWidth;
	const label = shape.label || '';

	const onTextUpdate = useCallback((self) => {
		const [ labelXOffset, labelYOffset ] = getTextOffsets(self.geometry, textOffsetPt);
		self.position.set(shapeCenter.x - labelXOffset, shapeCenter.y - labelYOffset, 0);
	}, [label])

	const onUpdateCurveArea = useCallback((self) => {
		
	}, [])

  return (
		<group>
			<mesh ref={_curveArea} onUpdate={onUpdateCurveArea}>
				<shapeBufferGeometry attach="geometry" args={[curveArea]} />
				<meshBasicMaterial attach="material" color={color} transparent opacity={0.3} />
			</mesh>
			<mesh ref={_text} onUpdate={onTextUpdate} visible={!!label}>
				<textGeometry args={[label, { font, size: textSize, height: 1 }]}/>
				<meshLambertMaterial attach='material' color={'black'}/>
			</mesh>
			<line ref={_line}>
				<bufferGeometry attach="geometry" onUpdate={onUpdateLine} />
				<lineBasicMaterial attach="material" color={color} linewidth={3} linecap={'round'} linejoin={'round'} />
			</line>
			<DragHandles selected={selected} points={points.slice(0, 4)} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</group>
  )
}


export default CircleLinkShape;
