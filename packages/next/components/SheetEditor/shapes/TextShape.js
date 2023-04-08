import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import _ from "underscore";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import DragHandles from './DragHandles';

import { getWorldPt, ptToThreeVector, containerSize } from "./utils";

const TextShape = ({ font, selected, shape, color, sheetWidth, sheetHeight }) => {
	const ptArray = shape.poly.ptArray;
	const textPoint = useRef(new THREE.Vector3()).current;
	const _group = useRef(null);
	const _line = useRef(null);
	const _textMesh = useRef(null);
	const _prevShapeCenter = useRef({ x: 0, y: 0 }).current;

  const [points] = useMemo(() => {
		const points = [0, 1, 2, 3].map(i => (
			ptToThreeVector(ptArray[i], sheetWidth, sheetHeight, containerSize)
		));
		points.push(points[0]);

		_prevShapeCenter.x = (points[0].x + points[1].x + points[2].x + points[3].x) / 4;
		_prevShapeCenter.y = (points[0].y + points[1].y + points[2].y + points[3].y) / 4;
		
		textPoint.set(
			Math.min(points[0].x, points[1].x, points[2].x, points[3].x),
			Math.max(points[0].y, points[1].y, points[2].y, points[3].y),
			0
		);
		
		return [points];
	}, []);

	const updatePoints = (pts, _ptArray, _textPoint) => {
		[0,1,2,3].forEach((i, idx) => {
			const { x, y } = getWorldPt(_ptArray[i], sheetWidth, sheetHeight, containerSize);
			pts[idx].set(x, y, 0);
		})

		_textPoint.set(
			Math.min(pts[0].x, pts[1].x, pts[2].x, pts[3].x),
		  Math.max(pts[0].y, pts[1].y, pts[2].y, pts[3].y),
			0
		)
	}

	const getShapeCenter = (pts) => ({
		x: (pts[0].x + pts[1].x + pts[2].x + pts[3].x) / 4,
		y: (pts[0].y + pts[1].y + pts[2].y + pts[3].y) / 4,
	});

	useFrame((state) => {
		if (!shape.needsUpdated) return;
		shape.needsUpdated = false;
		
		updatePoints(points, ptArray, textPoint);
		const shapeCenter = getShapeCenter(points);
		if (_prevShapeCenter.x === shapeCenter.x && _prevShapeCenter.y === shapeCenter.y) return;

		_line.current.geometry.setFromPoints(points);
		_textMesh.current.position.set(textPoint.x + paddingX, textPoint.y + paddingY, 0);
	})

  const onLineUpdate = useCallback(self => {
		self.geometry.setFromPoints(points)
	}, [points, selected])
  
	const textSize = 30;
	const fontSize = shape.fontSize * textSize/sheetWidth;
	const [ paddingX, paddingY ] = [fontSize/2, -fontSize*2];
	const message = shape.message || '';
	
	const onUpdateText = useCallback((self) => {
		self.position.set(textPoint.x + paddingX, textPoint.y + paddingY, 0);
	}, [message, fontSize, textPoint.x, textPoint.y])

	const onGroupUpdate = useCallback(self => {
		updatePoints(points, ptArray, textPoint);
		const shapeCenter = getShapeCenter(points);
		
		_prevShapeCenter.x = shapeCenter.x;
		_prevShapeCenter.y = shapeCenter.y;
		
		self.position.set(0, 0, 0);
	}, [points, selected])

	
	return (
		<group ref={_group} onUpdate={onGroupUpdate}>
			<line ref={_line} onUpdate={onLineUpdate} visible={!!selected || shape.showBorder}>
				<bufferGeometry attach="geometry"  />
				<lineBasicMaterial attach="material" color={color} />
			</line>
			<mesh onUpdate={onUpdateText} ref={_textMesh}>
				<textGeometry args={[message, { font, size: fontSize, height: 1 }]}/>
				<meshLambertMaterial attach='material' />
			</mesh>
			<DragHandles selected={selected} points={points.slice(0, 4)} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</group>
	)
}

export default TextShape;
