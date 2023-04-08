import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import _ from "underscore";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import DragHandles from './DragHandles'

import { TEXT_SIZE, hashPoints, getTextOffsets, DRAG_HANDLE_RADIUS } from "./utils";

const SplineAreaShape = ({ selected, shape, font, color, sheetWidth, sheetHeight, calibrationScale }) => {
	const ptArray = shape.poly.ptArray;
	const points = useRef([]).current;
	const marks = useRef([]).current;
	const bbBox = useRef(new THREE.Box3()).current;
	const shapeCenter = useRef(new THREE.Vector3(0, 0, 0)).current;
	const _prevCenter = useRef(new THREE.Vector3(0, 0, 0)).current;
	const textOffsetPt = useRef(new THREE.Vector3(0, 0, 0)).current;
	const _line = useRef(null);
	const _textMesh = useRef(null);
	const _curveMesh = useRef(null);
	const _prevPts = useRef({ length: 0, first: {}, last: {} }).current;

	const updatePrevPts = (_ptArr) => {
		const _first = _ptArr[0];
		const _last = _ptArr[_ptArr.length - 1];
		_prevPts.first.x = _first.x;
		_prevPts.first.y = _first.y;
		_prevPts.last.x = _last.x;	
		_prevPts.last.y = _last.y;
		_prevPts.length = _ptArr.length;
	}

	const setShapeCenter = (_points, _shapeCenter) => {
		bbBox.setFromPoints(_points);
		bbBox.getCenter(_shapeCenter);
	}


	const updateMarks = (_points) => {
		const perMark = 4;
		marks.length = 0;
		if (_points.length < perMark) return marks.push(..._points);
		
		const numMarks = Math.floor(_points.length / perMark);
		const _marks = Array.from({ length: numMarks }, (_, i) => {
			const point = _points[i * perMark];
			return point;
		})
		marks.push(..._marks, _points[_points.length - 1]);
	}

	const addPoints = (_ptArr, shouldCloseShape) => {
		points.length = 0;
		const _points = _ptArr.reduce((acc, pt) => {
			acc.push(new THREE.Vector3(pt.x / sheetWidth - 0.5, (sheetHeight - pt.y) / sheetHeight - 0.5, 0))
			return acc;
		}, [])
		points.push(..._points);
		if (shouldCloseShape) points.push(_points[0]);

		updateMarks(_points);
	}


	const [curve] = useMemo(() => {
		const isNew = points.length === 0;
		
		addPoints(ptArray, isNew); // init points
		setShapeCenter(points, shapeCenter);
		_prevCenter.copy(shapeCenter);
		updatePrevPts(ptArray);

		const curve = new THREE.Shape()
		curve.moveTo(points[0].x, points[0].y)
		points.forEach(pt => curve.lineTo(pt.x, pt.y));
		
		return [curve]
	}, [])

	const updatePoints = (_points, _ptArr) => {
		_ptArr.forEach((pt, i) => {
			if (_points[i]) _points[i].x = pt.x / sheetWidth - 0.5;
			if (_points[i])_points[i].y = (sheetHeight - pt.y) / sheetHeight - 0.5;
		})
	}

	useFrame((state) => {
		if (!shape.needsUpdated) return;
		shape.needsUpdated = false;
		
		const isBeingDrawn = ptArray.length !== points.length;
		if (isBeingDrawn) {
			addPoints(ptArray);
		} else {
			updatePoints(points, ptArray);
		}
		setShapeCenter(points, shapeCenter);
		const xOffset = _prevCenter.x - shapeCenter.x;
		const yOffset = _prevCenter.y - shapeCenter.y;

		const curvePos = _curveMesh.current.position;
			_curveMesh.current.position.set(curvePos.x - xOffset, curvePos.y - yOffset);
			
		_line.current.geometry.setFromPoints(points);
		setShapeCenter(points, shapeCenter);
	
		const textPos = _textMesh.current.position;
		_textMesh.current.position.set(textPos.x - xOffset, textPos.y - yOffset);
		
		updatePrevPts(ptArray);
		_prevCenter.copy(shapeCenter);
	})

	const onUpdateLine = useCallback(self => {
		self.geometry.setFromPoints(points)
	}, [points])

	const textSize = TEXT_SIZE / sheetWidth;
	const label = !calibrationScale ? 'no data' : shape.getAreaText(calibrationScale);
	
	const onUpdateText = useCallback((self) => {
		const [ labelXOffset, labelYOffset ] = getTextOffsets(self.geometry, textOffsetPt);
		self.position.set(shapeCenter.x - labelXOffset, shapeCenter.y - labelYOffset, 0);
	}, [label, shapeCenter.x, shapeCenter.y])
	
	const onUpdateCurve = useCallback(self => {
		self.position.set(0, 0, 0);
	}, [])

	return (
		<group>
			<mesh ref={_curveMesh} onUpdate={onUpdateCurve}>
				<shapeBufferGeometry attach="geometry" args={[curve]} />
				<meshBasicMaterial attach="material" color={color} transparent opacity={0.3} />
			</mesh>
			<mesh onUpdate={onUpdateText} ref={_textMesh}>
				<textGeometry args={[label, { font, size: textSize, height: 1 }]}/>
				<meshLambertMaterial attach='material' color="black" />
			</mesh>
			<line ref={_line} onUpdate={onUpdateLine}>
				<bufferGeometry attach="geometry" />
				<lineBasicMaterial attach="material" color={color} />
			</line>
			<DragHandles selected={selected} points={marks} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</group>
  )
}

export default SplineAreaShape;
