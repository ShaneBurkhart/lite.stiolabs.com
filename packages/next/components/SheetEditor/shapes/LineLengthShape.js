import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import _ from "underscore";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import DragHandles from './DragHandles';

import { TEXT_SIZE, getTextOffsets, containerSize } from "./utils";

const LineLengthShape = ({ font, selected, shape, color, sheetWidth, sheetHeight, calibrationScale }) => {
	const ptArray = shape.poly.ptArray;
	const textOffsetPt = useRef(new THREE.Vector3(0, 0, 0)).current;
	const _line = useRef(null);
	const _text = useRef(null);
	const shapeCenter = useRef(new THREE.Vector3(0, 0, 0)).current;
	const _prevPtArray = useRef([{ x: 0, y: 0 },{ x: 0, y: 0 }]).current;
	

	const setShapeCenter = (_points, _shapeCenter) => {
		if (_points.length === 1) return _shapeCenter.set(_points[0].x, _points[0].y, 0);
		_shapeCenter.lerpVectors(_points[0], _points[1], 0.5);
	}

	const updatePoints = (pts, _ptArray,) => {
		[0,1].forEach((i, idx) => {
			pts[idx].x = _ptArray[i].x / sheetWidth - 0.5;
			pts[idx].y = (sheetHeight - _ptArray[i].y) / sheetHeight - 0.5;
		})
	}

	const updatePrevPts = (_ptArray) => {
		_ptArray.forEach((pt, i) => {
			_prevPtArray[i].x = pt.x;
			_prevPtArray[i].y = pt.y;
		})
	}

	const [points] = useMemo(() => {
		const points = ptArray.map(pt =>
			new THREE.Vector3(pt.x / sheetWidth - 0.5, (sheetHeight - pt.y) / sheetHeight - 0.5, 0), 
		);
		
		setShapeCenter(points, shapeCenter)
		updatePrevPts(ptArray);
		return [points];
	}, [])
	
	useFrame((state) => {
		if (!shape.needsUpdated) return;
		shape.needsUpdated = false;

		updatePoints(points, ptArray);
		
		_line.current.geometry.setFromPoints(points);
		setShapeCenter(points, shapeCenter)
		
		_text.current.position.set(shapeCenter.x - textOffsetPt.x, shapeCenter.y - textOffsetPt.y, 0);
	})

	const onUpdateLine = useCallback(self => {
		self.geometry.setFromPoints(points)
	}, [points])

	const textSize = TEXT_SIZE / sheetWidth;
	const label = !calibrationScale ? 'no data' : shape.getLengthText(calibrationScale)
	
	const onUpdateText = useCallback((self) => {
		const [ labelXOffset, labelYOffset ] = getTextOffsets(self.geometry, textOffsetPt);
		self.position.set(shapeCenter.x - labelXOffset, shapeCenter.y - labelYOffset, 0);
	}, [label, shapeCenter.x, shapeCenter.y])
	
	return (
		<group>
			<line ref={_line} onUpdate={onUpdateLine}>
				<bufferGeometry attach="geometry" />
				<lineBasicMaterial attach="material" color={color} />
			</line>
			<mesh ref={_text} onUpdate={onUpdateText}>
				<textGeometry args={[label, { font, size: textSize, height: 1 }]}/>
				<meshLambertMaterial attach='material' color={'black'}/>
			</mesh>
			<DragHandles selected={selected} points={points} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</group>
  )
}

export default LineLengthShape;
