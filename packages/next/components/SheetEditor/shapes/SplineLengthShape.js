import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import _ from "underscore";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import DragHandles from './DragHandles';

import { TEXT_SIZE, hashPoints, getTextOffsets, DRAG_HANDLE_RADIUS } from "./utils";

const SplineLengthShape = ({ selected, shape, font, color, sheetWidth, sheetHeight, calibrationScale }) => {
	const ptArray = shape.poly.ptArray;
	const points = useRef([]).current;
	const marks = useRef([]).current;
	const shapeCenter = useRef(new THREE.Vector3(0, 0, 0)).current;
	const textOffsetPt = useRef(new THREE.Vector3(0, 0, 0)).current;
	const _text = useRef(null);
	const _line = useRef(null);

	const setShapeCenter = (_points) => {
		if (_points.length === 1) return shapeCenter.set(_points[0].x, _points[0].y, 0);
		const ctrPts = [_points[Math.ceil(_points.length / 2) - 1], _points[Math.ceil(_points.length / 2)]];
		shapeCenter.lerpVectors(ctrPts[0], ctrPts[1], 0.5);
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
	
	const addPoints = (_ptArr) => {
		points.length = 0;
		const _points = _ptArr.reduce((acc, pt) => {
			acc.push(new THREE.Vector3(pt.x / sheetWidth - 0.5, (sheetHeight - pt.y) / sheetHeight - 0.5, 0))
			return acc;
		}, [])
		points.push(..._points);
		updateMarks(_points);

		setShapeCenter(points);
	}

	const initPoints = useMemo(() => {
		addPoints(ptArray);
	}, [])


	const updatePoints = (_points, _ptArr) => {
		_ptArr.forEach((pt, i) => {
			if (_points[i]) _points[i].x = pt.x / sheetWidth - 0.5;
			if (_points[i])_points[i].y = (sheetHeight - pt.y) / sheetHeight - 0.5;
		})
	}

	useFrame((state) => {
		if (!shape.needsUpdated) return;
	
		if (ptArray.length !== points.length) {
			addPoints(ptArray);
		} else {
			updatePoints(points, ptArray);
			const centerPoints = points.length >= 2 ? [points[Math.ceil(points.length / 2) - 1], points[Math.ceil(points.length / 2)]] : [points[0], points[0]];
			shapeCenter.set((centerPoints[0].x + centerPoints[1].x)/2, (centerPoints[0].y + centerPoints[1].y)/2, 0);
		}
		
		
		_line.current.geometry.setFromPoints(points);
		_text.current.position.set(shapeCenter.x - textOffsetPt.x, shapeCenter.y - textOffsetPt.y, 0);
		shape.needsUpdated = false;
	})

	const onUpdateLine = useCallback(self => {
		self.geometry.setFromPoints(points)
	}, [points])

	const textSize = TEXT_SIZE / sheetWidth;
	const label = !calibrationScale ? 'no data' : shape.getLengthText(calibrationScale)
	
	const onUpdateText = useCallback((self) => {
		const [ labelXOffset, labelYOffset ] = getTextOffsets(self.geometry, textOffsetPt);
		self.position.set(shapeCenter.x - labelXOffset, shapeCenter.y - labelYOffset, 0);
	}, [label])

  return (
		<group>
			<line ref={_line} onUpdate={onUpdateLine}>
				<bufferGeometry attach="geometry" />
				<lineBasicMaterial attach="material" color={color} linewidth={3} linecap={'round'} linejoin={'round'} />
			</line>
			<mesh ref={_text} onUpdate={onUpdateText}>
				<textGeometry args={[label, { font, size: textSize, height: 1 }]}/>
				<meshLambertMaterial attach='material' color={'black'}/>
			</mesh>
			<DragHandles selected={selected} points={marks} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</group>
  )
}

export default SplineLengthShape;
