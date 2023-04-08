import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import _ from "underscore";

import { useFrame } from "@react-three/fiber";

import DragHandles from './DragHandles';

import { getWorldPt, ptToThreeVector, containerSize } from "./utils";

const RectangleShape = ({ selected, shape, color, sheetWidth, sheetHeight }) => {
	const ptArray = shape.poly.ptArray;
	const _line = useRef(null);
	const _prevShapeCenter = useRef({ x: 0, y: 0 }).current;

	const points = useMemo(() => {
		const points = [0,1,2,3].map(i => (
			ptToThreeVector(ptArray[i], sheetWidth, sheetHeight, containerSize)
		));
		points.push(points[0]);

		_prevShapeCenter.x = (points[0].x + points[1].x + points[2].x + points[3].x) / 4;
		_prevShapeCenter.y = (points[0].y + points[1].y + points[2].y + points[3].y) / 4;

		return points;
	}, []);

	const updatePoints = (pts, _ptArray) => {
		[0,1,2,3].forEach((i, idx) => {
			const { x, y } = getWorldPt(_ptArray[i], sheetWidth, sheetHeight, containerSize);
			pts[idx].set(x, y, 0);
		})
	}

	const getShapeCenter = (pts) => ({
		x: (pts[0].x + pts[1].x + pts[2].x + pts[3].x) / 4,
		y: (pts[0].y + pts[1].y + pts[2].y + pts[3].y) / 4,
	});

	useFrame((state) => {
		if (!shape.needsUpdated) return;
		shape.needsUpdated = false;
		
		updatePoints(points, ptArray);
		_line.current.geometry.setFromPoints(points);
	})

  const onLineUpdate = useCallback(self => {
		updatePoints(points, ptArray);
		const shapeCenter = getShapeCenter(points);
		
		_prevShapeCenter.x = shapeCenter.x;
		_prevShapeCenter.y = shapeCenter.y;

		self.geometry.setFromPoints(points)
	}, [points, selected])
  
	return (
		<group>
			<line ref={_line} onUpdate={onLineUpdate}>
				<bufferGeometry attach="geometry" />
				<lineBasicMaterial attach="material" color={color} linecap={'round'} linejoin={'round'} />
			</line>
			<DragHandles selected={selected} points={points.slice(0,4)} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</group>
  )
}

export default RectangleShape;
