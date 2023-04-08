import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import { useFrame } from "@react-three/fiber";

import DragHandles from './DragHandles';

import { ptToThreeVector, getWorldPt, containerSize } from "./utils";


const LineShape = ({ selected, shape, color, sheetWidth, sheetHeight }) => {
	const ptArray = shape.poly.ptArray;
	const _line = useRef(null)
	const _prevPtArray = useRef([{ x: 0, y: 0 },{ x: 0, y: 0 }]).current;

	const updatePoints = (pts, _ptArray,) => {
		[0,1].forEach((i, idx) => {
			const { x, y } = getWorldPt(_ptArray[i], sheetWidth, sheetHeight, containerSize);
			pts[idx].set(x, y, 0);
		})
	}

	const updatePrevPts = (_ptArray) => {
		_ptArray.forEach((pt, i) => {
			_prevPtArray[i].x = pt.x;
			_prevPtArray[i].y = pt.y;
		})
	}

	const points = useMemo(() => {
		const points = ptArray.map(pt =>
			ptToThreeVector(pt, sheetWidth, sheetHeight, containerSize)
		)

		updatePrevPts(ptArray);
		return points;
	}, [])

	useFrame((state) => {
		if (!shape.needsUpdated) return;
		shape.needsUpdated = false;

		updatePoints(points, ptArray);
		
		_line.current.geometry.setFromPoints(points);
		
		updatePrevPts(ptArray);
	})
  
	const onUpdateLine = useCallback(self => {
		self.geometry.setFromPoints(points)
	}, [points])
  
	return (
		<group>
			<line ref={_line} onUpdate={onUpdateLine}>
				<bufferGeometry attach="geometry" />
				<lineBasicMaterial attach="material" color={color} linewidth={3} linecap={'round'} linejoin={'round'} />
			</line>
			<DragHandles selected={selected} points={points} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</group>
  )
}

export default LineShape;
