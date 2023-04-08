import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import { useFrame } from "@react-three/fiber";

import DragHandles from './DragHandles';

import { ptToThreeVector, getWorldPt, containerSize } from "./utils";

const HighlightShape = ({ selected, shape, color, sheetWidth, sheetHeight }) => {
	const ptArray = shape.poly.ptArray;
	const points = useRef([]).current;
	const marks = useRef([]).current;
	const _mesh = useRef(null);

	const updatePoints = (_points, _ptArr) => {
		_ptArr.forEach((pt, i) => {
			const { x, y } = getWorldPt(pt, sheetWidth, sheetHeight, containerSize);
			if (_points[i]) _points[i].set(x, y, 0);
		})
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
			acc.push(ptToThreeVector(pt, sheetWidth, sheetHeight, containerSize))
			return acc;
		}, [])
		points.push(..._points);
		updateMarks(_points);
	}

	const initPoints = useMemo(() => {
		addPoints(ptArray);
	}, [])

	useFrame((state) => {
		if (!shape.needsUpdated) return;
		
		if (ptArray.length !== points.length) {
			addPoints(ptArray);
		} else {
			updatePoints(points, ptArray);
		}

		_mesh.current.geometry.setPoints(points);
		shape.needsUpdated = false;
	})

	const onMeshUpdate = useCallback(self => {
		self.geometry.setPoints(points)
	}, [])

  return (
		<group>
			<mesh ref={_mesh} onUpdate={onMeshUpdate}>
				<meshLine attach="geometry"/>
				<meshLineMaterial attach="material" color={color} transparent opacity={0.5} lineWidth={20} />
			</mesh>
			<DragHandles selected={selected} points={marks} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</group>
  )
}

export default HighlightShape;
