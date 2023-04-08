import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import _ from "underscore";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import DragHandles from './DragHandles';


const ArrowShape = ({ selected, shape, color, sheetWidth, sheetHeight }) => {
	const ptArray = shape.poly.ptArray;
	const _lineDir = useRef(null);

	const headSize = 40;
	const headWidth = headSize / sheetWidth;
	const headHeight = headSize / sheetHeight;

	const updatePoints = (pts, _ptArray,) => {
		[0,1].forEach((i, idx) => {
			pts[idx].x = _ptArray[i].x / sheetWidth - 0.5;
			pts[idx].y = (sheetHeight - _ptArray[i].y) / sheetHeight - 0.5;
		})
	}

	const [points, arrow] = useMemo(() => {
		const points = ptArray.map(pt => (
			new THREE.Vector3(pt.x / sheetWidth - 0.5, (sheetHeight - pt.y) / sheetHeight - 0.5, 0)
		));

		const [start, end] = points;
		const lineLength = start.distanceTo(end);
		_lineDir.current = end.clone().sub(start).normalize();

		const arrow = new THREE.ArrowHelper(
			_lineDir.current,
			start,
			lineLength,
			color,
			headWidth,
			headHeight,
		);

		return [points, arrow]
	}, [])
	
	useFrame((state) => {
		if (!shape.needsUpdated) return;
		shape.needsUpdated = false;
		
		updatePoints(points, ptArray);
		
		const [start, end] = points;
		arrow.setLength(start.distanceTo(end), headWidth, headHeight);
		
		_lineDir.current.copy(end).sub(start).normalize();
		arrow.setDirection(_lineDir.current);
		arrow.position.set(start.x, start.y, 0);
	})
	
	const onUpdateLine = useCallback(self => { self.setColor(color) }, [color])

  return (
		<group>
			<primitive object={arrow} onUpdate={onUpdateLine}/>
			<DragHandles selected={selected} points={points} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</group>
  )
}

export default ArrowShape;
