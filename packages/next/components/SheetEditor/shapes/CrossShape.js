import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import _ from "underscore";

import { useFrame } from "@react-three/fiber";

import DragHandles from './DragHandles';

import { getWorldPt, ptToThreeVector, containerSize } from "./utils";

const CrossShape = ({ selected, shape, color, sheetWidth, sheetHeight }) => {
	const ptArray = shape.poly.ptArray;
	const _line1 = useRef(null);
	const _line2 = useRef(null);
	const _prevPtArray = useRef(null);

	const updatePrevPtArray = (_ptArray) => {
		_prevPtArray.current = _ptArray.map(({x,y}) => ({x,y}));
	}

	const [points] = useMemo(() => {
		const points = ptArray.map(pt => (
			ptToThreeVector(pt, sheetWidth, sheetHeight, containerSize)
		));
		updatePrevPtArray(ptArray);
		return [points]
	}, [])

	const updatePoints = (_points, _ptArray) => {
		_points.forEach((pt, i) => {
			const {x,y} = getWorldPt(ptArray[i], sheetWidth, sheetHeight, containerSize);
			pt.set(x, y, 0);
		})
	}

	const points1 = [points[0], points[2]];
	const points2 = [points[1], points[3]];

	useFrame((state) => {
		if (!shape.needsUpdated) return;
		shape.needsUpdated = false;

		updatePoints(points, ptArray);
		_line1.current.geometry.setFromPoints(points1);
		_line2.current.geometry.setFromPoints(points2);

		updatePrevPtArray(ptArray);
	})

  const onUpdate1 = useCallback(self => { self.setFromPoints(points1) }, [])
  const onUpdate2 = useCallback(self => { self.setFromPoints(points2) }, [])
  
	return (
		<group>
			<line ref={_line1}>
				<bufferGeometry attach="geometry" onUpdate={onUpdate1} />
				<lineBasicMaterial attach="material" color={color} linewidth={3} linecap={'round'} linejoin={'round'} />
			</line>
			<line ref={_line2}>
				<bufferGeometry attach="geometry" onUpdate={onUpdate2} />
				<lineBasicMaterial attach="material" color={color} linewidth={3} linecap={'round'} linejoin={'round'} />
			</line>
			<DragHandles selected={selected} points={[...points1, ...points2]} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</group>
  )
}

export default CrossShape;
