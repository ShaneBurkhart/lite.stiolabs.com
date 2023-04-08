import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import DragHandles from './DragHandles';

import { ptToThreeVector, getWorldPt, containerSize } from "./utils";

const CAMERA_WIDTH = 180;
const LENS_RADIUS = 1400;

const CameraShape = ({ selected, shape, color, sheetWidth, sheetHeight }) => {
	const ptArray = shape.poly.ptArray;
	const shapeCenter = useRef(new THREE.Vector3()).current;
	const _group = useRef(null);
	const _prevShapeCenter = useRef({ x: 0, y: 0 }).current;
	
	const cameraWidth = CAMERA_WIDTH / sheetWidth;
	const cameraHeight = cameraWidth * 2/3 * sheetWidth / sheetHeight;
	const [hw, hh] = [cameraWidth / 2, cameraHeight / 2];

	const updatePoints = (pts, _shapeCenter) => {
		[[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].forEach((offset, i) => {
			pts[i].x =_shapeCenter.x + offset[0];
			pts[i].y =_shapeCenter.y + offset[1];
		});
	}

	const [curve, ellipse, points] = useMemo(() => {
		const center = getWorldPt(ptArray[0], sheetWidth, sheetHeight, containerSize);
		shapeCenter.set(center.x, center.y, 0);
		
		const curve = new THREE.Shape();
		curve.moveTo(center.x - hw, center.y - hh);
		curve.lineTo(center.x + hw, center.y - hh);
		curve.lineTo(center.x + hw, center.y + hh);
		//notch
		curve.lineTo(center.x + hw/3, center.y + hh);
		curve.lineTo(center.x + hw/5, center.y + (hh + hh/3.3));
		curve.lineTo(center.x - hw/5, center.y + (hh + hh/3.3));
		curve.lineTo(center.x - hw/3, center.y + hh);
		// end notch
		curve.lineTo(center.x - hw, center.y + hh);
		curve.lineTo(center.x - hw, center.y - hh);
		
		
		const ellipse = new THREE.Shape();
		const radius = { x: cameraWidth * LENS_RADIUS / sheetWidth, y: cameraWidth * LENS_RADIUS / sheetHeight }
		ellipse.absellipse(center.x, center.y, radius.x, radius.y, 0, 6.28, false, 0);
	
		const points = new Array(4).fill(null).map(() => new THREE.Vector3(0,0,0));
		updatePoints(points, center);

		_prevShapeCenter.x = center.x;
		_prevShapeCenter.y = center.y;
		
		return [curve, ellipse, points];
	}, [])

	const updateShapeCenter = (_shapeCenter, _ptArr) => {
		const { x, y } = getWorldPt(_ptArr[0], sheetWidth, sheetHeight, containerSize);
		_shapeCenter.set(x, y);
	}
	
	useFrame((state) => {
		if (!shape.needsUpdated) return;
		shape.needsUpdated = false;
		
		updateShapeCenter(shapeCenter, ptArray);
		updatePoints(points, shapeCenter);
		const offsetX = shapeCenter.x - _prevShapeCenter.x;
		const offsetY = shapeCenter.y - _prevShapeCenter.y;
		const groupPos = _group.current.position;
		_group.current.position.set(groupPos.x + offsetX, groupPos.y + offsetY);

		_prevShapeCenter.x = shapeCenter.x;
		_prevShapeCenter.y = shapeCenter.y;
	})
	
	return (
		<>
			<group ref={_group}>
				<mesh>
					<shapeBufferGeometry attach="geometry" args={[curve]} />
					<meshBasicMaterial attach="material" color={color} />
				</mesh>
				<mesh>
					<shapeBufferGeometry attach="geometry" args={[ellipse]} />
					<meshBasicMaterial transparent attach="material" color={"#FFF"} opacity={0.55} />
				</mesh>
			</group>
			<DragHandles selected={selected} points={points.slice(0,4)} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</>
	)
}

export default CameraShape;
