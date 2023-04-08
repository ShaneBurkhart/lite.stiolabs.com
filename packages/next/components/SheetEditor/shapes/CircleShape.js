import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import _ from "underscore";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import DragHandles from './DragHandles';

import { ptToThreeVector, getWorldPt, containerSize } from "./utils";

const CircleShape = ({ selected, shape, color, sheetWidth, sheetHeight }) => {
	const ptArray = shape.poly.ptArray;
	const _line = useRef(null);
	
	const getShapeCenter = (pts) => ({
		x: (pts[0].x + pts[1].x + pts[2].x + pts[3].x) / 4,
		y: (pts[0].y + pts[1].y + pts[2].y + pts[3].y) / 4,
	});

	const [points, curve, shapeCenter] = useMemo(() => {
		const points = [0,1,2,3].map(i => (
			ptToThreeVector(ptArray[i], sheetWidth, sheetHeight, containerSize)
		));
		
		const _ctr = getShapeCenter(points);
		const shapeCenter = new THREE.Vector3(_ctr.x, _ctr.y, 0);
		const radiusX = Math.abs(points[0].x - _ctr.x);
		const radiusY = Math.abs(points[0].y - _ctr.y);
		
		const curve = new THREE.EllipseCurve(
			shapeCenter.x, shapeCenter.y,
			radiusX, radiusY,           
			0,  2 * Math.PI,  
			false, 0                 
		);

		return [points, curve, shapeCenter];
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

	useFrame((state) => {
		if (!shape.needsUpdated) return;
		shape.needsUpdated = false;
		
		updatePoints(points, ptArray);
		const _shapeCenter = getShapeCenter(points);
		shapeCenter.set(_shapeCenter.x, _shapeCenter.y, 0);
		
		
		updateCurveFromPoints(curve, points, shapeCenter, _line.current.geometry);
	})

	const onLineUpdate = useCallback((self) => {
		updateCurveFromPoints(curve, points, shapeCenter, self.geometry);
	}, [curve])

	return (
		<group>
			<line ref={_line} onUpdate={onLineUpdate}>
				<bufferGeometry attach="geometry" />
				<lineBasicMaterial attach="material" color={color} linewidth={3} />
			</line>
			<DragHandles selected={selected} points={points} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</group>
  )
}


export default CircleShape;
