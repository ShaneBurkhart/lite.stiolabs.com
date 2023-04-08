import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import _ from "underscore";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import DragHandles from './DragHandles';

import { TEXT_SIZE, getTextOffsets, getWorldPt, ptToThreeVector, containerSize } from "./utils";

const RectangleAreaShape = ({ selected, shape, color, sheetWidth, sheetHeight, font, calibrationScale }) => {
	const ptArray = shape.poly.ptArray;
	const textOffsetPt = useRef(new THREE.Vector3(0, 0, 0)).current;
	const shapeCenter = useRef(new THREE.Vector3(0, 0, 0)).current;
	const _line = useRef(null);
	const _prevPts = useRef([]).current;
	const _text = useRef(null);
	const _plane = useRef(null);
	const _prevPtArray = useRef(ptArray.map(({x,y}) => ({x,y})));

	const [points, width, height] = useMemo(() => {
		const points = [0,1,2,3].map(i => (
			ptToThreeVector(ptArray[i], sheetWidth, sheetHeight, containerSize)
		));
		points.forEach(pt => _prevPts.push({ x: pt.x, y: pt.y }));
		points.push(points[0]);

		const [pt1, pt2, pt3] = points;
		const width = Math.abs(pt1.x - pt2.x);
		const height = Math.abs(pt2.y - pt3.y);
		shapeCenter.set((pt1.x + pt2.x) / 2, (pt2.y + pt3.y) / 2, 0);

		return [points, width, height];
	}, []);

	const updatePoints = (pts, _ptArray) => {
		[0,1,2,3].forEach((i, idx) => {
			const { x, y } = getWorldPt(_ptArray[i], sheetWidth, sheetHeight, containerSize);
			pts[idx].set(x, y, 0);
		})
	}

	const updatePrevPtArray = (_ptArray) => {
		_prevPtArray.current = _ptArray.map(({x,y}) => ({x,y}));
	}

	useFrame((state) => {
		if (!shape.needsUpdated) return;
		shape.needsUpdated = false;
		
		const prevWidth = _prevPts[1].x - _prevPts[0].x;
		const prevHeight = _prevPts[2].y - _prevPts[1].y;
		updatePoints(points, ptArray);
		const newWidth = points[1].x - points[0].x;
		const newHeight = points[2].y - points[1].y;

		_line.current.geometry.setFromPoints(points);
		shapeCenter.set((points[0].x + points[1].x) / 2, (points[1].y + points[2].y) / 2, 0);
		
		const didResize = prevWidth !== newWidth || prevHeight !== newHeight;
		if (didResize) {
			const currentScale = _plane.current.scale;
			const scaleX = newWidth / prevWidth * currentScale.x;
			const scaleY = newHeight / prevHeight * currentScale.y;
			_plane.current.scale.set(scaleX, scaleY, 1);
			_plane.current.position.set(shapeCenter.x, shapeCenter.y, 0);
		} else {
			_plane.current.position.set(shapeCenter.x, shapeCenter.y, 0);
		}

		_text.current.position.set(shapeCenter.x - textOffsetPt.x, shapeCenter.y - textOffsetPt.y, 0);
		
		updatePrevPtArray(ptArray);
	})

  const onUpdateLine = useCallback(self => {
		self.geometry.setFromPoints(points)
	}, [points])

	const textSize = TEXT_SIZE / sheetWidth;
	const label = !calibrationScale ? 'no data' : shape.getAreaText(calibrationScale);
	
	const onUpdateText = useCallback((self) => {
		const [ labelXOffset, labelYOffset ] = getTextOffsets(self.geometry, textOffsetPt);
		self.position.set(shapeCenter.x - labelXOffset, shapeCenter.y - labelYOffset, 0);
	}, [label])
	
	return (
		<group>
			<mesh ref={_plane} position={shapeCenter}>
				<planeBufferGeometry attach="geometry" args={[width, height]} />
				<meshBasicMaterial attach="material" color={color} transparent opacity={0.3} />
			</mesh>
			<mesh ref={_text} onUpdate={onUpdateText}>
				<textGeometry args={[label, { font, size: textSize, height: 1 }]}/>
				<meshLambertMaterial attach='material' color={'black'}/>
			</mesh>
			<line ref={_line} onUpdate={onUpdateLine}>
				<bufferGeometry attach="geometry" />
				<lineBasicMaterial attach="material" color={color}  linecap={'round'} linejoin={'round'} />
			</line>
			<DragHandles selected={selected} points={points.slice(0, 4)} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</group>
  )
}


export default RectangleAreaShape;
