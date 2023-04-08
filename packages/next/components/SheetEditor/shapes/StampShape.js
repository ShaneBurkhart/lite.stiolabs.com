import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import _ from "underscore";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import DragHandles from './DragHandles'

import { TEXT_SIZE, getTextOffsets, getWorldPt, containerSize } from "./utils";

const STAMP_FONT_SIZE = .008;
const STAMP_RADIUS = 50;

const StampShape = ({ font, selected, shape, color, sheetWidth, sheetHeight }) => {
	const ptArray = shape.poly.ptArray;
	const shapeCenter = useRef(new THREE.Vector3()).current;
	const _group = useRef(null);
	const _line = useRef(null);
	const _textMesh = useRef(null);
	const _prevPt = useRef({ x: 0, y: 0 }).current;
	const _prevShapeCenter = useRef({ x: 0, y: 0 }).current;
	const textOffsetPt = useRef(new THREE.Vector3(0, 0, 0)).current;
	
	let label = shape.stampKey || '';
	if (shape.task?.stamp) label = shape.task.stamp.key || '';
	label = label.toUpperCase();
	const rx = (STAMP_RADIUS / sheetWidth);
	const ry = (STAMP_RADIUS / sheetHeight);

	const updatePoints = (pts, _shapeCenter) => {
		[[rx, -ry], [-rx,-ry], [-rx, ry], [rx,ry]].forEach((offset, i) => {
			pts[i].x =_shapeCenter.x + offset[0];
			pts[i].y =_shapeCenter.y + offset[1];
		});
	}
	
	const [points, curve] = useMemo(() => {
		const center = getWorldPt(ptArray[0], sheetWidth, sheetHeight, containerSize)
		shapeCenter.set(center.x, center.y, 0);
		
		const curve = new THREE.EllipseCurve(
			shapeCenter.x, shapeCenter.y,
			rx, ry,
			0,  2 * Math.PI, 
			false, 0                
		);
	
		const points = new Array(4).fill(null).map(() => new THREE.Vector3(0,0,0));
		updatePoints(points, shapeCenter);
		
		_prevShapeCenter.x = shapeCenter.x;
		_prevShapeCenter.y = shapeCenter.y;
		
		return [points, curve];
	}, []);

	const updateShapeCenter = (_shapeCenter, _ptArr) => {
		const { x, y } = getWorldPt(_ptArr[0], sheetWidth, sheetHeight, containerSize);
		_shapeCenter.set(x, y, 0);
	}


	useFrame((state) => {
		if (!shape.needsUpdated) return;
		shape.needsUpdated = false;
		
		updateShapeCenter(shapeCenter, ptArray);
		updatePoints(points, shapeCenter);
		const groupPos = _group.current.position;
		const offsetX = shapeCenter.x - _prevShapeCenter.x;
		const offsetY = shapeCenter.y - _prevShapeCenter.y;
		_group.current.position.set(groupPos.x + offsetX, groupPos.y + offsetY);
		
		_prevShapeCenter.x = shapeCenter.x;
		_prevShapeCenter.y = shapeCenter.y;
		_prevPt.x = ptArray[0].x;
		_prevPt.y = ptArray[0].y;


	})

	const onGroupUpdate = useCallback(self => {
		updateShapeCenter(shapeCenter, ptArray);
		_prevShapeCenter.x = shapeCenter.x;
		_prevShapeCenter.y = shapeCenter.y;
	}, [selected])

  const onUpdateLine = useCallback(self => {
		self.geometry.setFromPoints(curve.getPoints(50))
	}, [curve])

	const onUpdateText = useCallback((self) => {
		const [ labelXOffset, labelYOffset ] = getTextOffsets(self.geometry, textOffsetPt);
		self.position.set(shapeCenter.x - labelXOffset, shapeCenter.y - labelYOffset, 0);
	}, [label])

	return (
		<>
			<group ref={_group} onUpdate={onGroupUpdate}>
				<line onUpdate={onUpdateLine} ref={_line}>
					<bufferGeometry attach="geometry" />
					<lineBasicMaterial attach="material" color={color} linewidth={3} linecap={'round'} linejoin={'round'} />
				</line>
				<mesh onUpdate={onUpdateText} ref={_textMesh}>
					<textGeometry bevelEnabled args={[label, { font, size: STAMP_FONT_SIZE, height: 1 }]}/>
					<meshLambertMaterial attach='material' color={color} />
				</mesh>
			</group>
			<DragHandles selected={selected} points={points} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</>
	)
}


export default StampShape;
