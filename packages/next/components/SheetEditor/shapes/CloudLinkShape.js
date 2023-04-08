import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import _ from "underscore";

import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import DragHandles from './DragHandles'
import { TEXT_SIZE, BEZIER_WIDTH, updatePoints, drawBezierCurve, getTextOffsets } from './utils'

import { StioShapeGeometry } from './STIOShapeGeometry'
extend({ StioShapeGeometry });

const CloudLinkShape = ({ selected, shape, color, sheetWidth, sheetHeight, font }) => {
	const _ptArray = shape.poly.ptArray;
	const textOffsetPt = useRef(new THREE.Vector3(0, 0, 0)).current;
	const bbBox = useRef(new THREE.Box3()).current;
	const shapeCenter = useRef(new THREE.Vector3(0, 0, 0)).current;
	const _prevCenter = useRef(new THREE.Vector3(0, 0, 0)).current;
	const _line = useRef(null)
	const _text = useRef(null)
	const _lineGeometry = useRef(null)
	const _meshGeometry = useRef(null)
	const _lastPoints = useRef(null)

	const setShapeCenter = (_points, _shapeCenter) => {
		bbBox.setFromPoints(_points);
		bbBox.getCenter(_shapeCenter);
	}

	const [points, curve] = useMemo(() => {
		const clipPtArray = _ptArray.map(pt => {
			return { x: pt.x / sheetWidth - 0.5, y: (sheetHeight - pt.y) / sheetHeight - 0.5 }
		})

		const points = [
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0, 0),
		]
		updatePoints(points, _ptArray, sheetWidth, sheetHeight, BEZIER_WIDTH)

		const curve = new THREE.Shape();
		drawBezierCurve(curve, clipPtArray, sheetWidth, sheetHeight);

		setShapeCenter(points, shapeCenter);
		
		_prevCenter.copy(shapeCenter)

		return [points, curve];
	}, [])

  const onUpdateLine = useCallback((self) => {
		self.setFromPoints(curve.getPoints(50))
	}, [])

	const textSize = TEXT_SIZE / sheetWidth;
	const label = shape.label || '';

	const onTextUpdate = useCallback((self) => {
		const [ labelXOffset, labelYOffset ] = getTextOffsets(self.geometry, textOffsetPt);
		self.position.set(shapeCenter.x - labelXOffset, shapeCenter.y - labelYOffset, 0);
	}, [label, shapeCenter.x, shapeCenter.y])

	// TODO  only update the shape if it has changed
	// how do we optimize the events for mouse and touch?
	// we can probably detect hover at the top level and pass that data down
	// check if the points have changed to call the update function
	// throttle the update function to avoid too many updates
	useFrame((state) => {
		// if (!_line.current || !selected) return;
		// return;
		if (!shape.needsUpdated) return;

		updatePoints(points, _ptArray, sheetWidth, sheetHeight, BEZIER_WIDTH);
		setShapeCenter(points, shapeCenter);
		
		const xOffset = _prevCenter.x - shapeCenter.x;
		const yOffset = _prevCenter.y - shapeCenter.y;
		
		const textPos = _text.current.position;
		_text.current.position.set(textPos.x - xOffset, textPos.y - yOffset);

		const clipPtArray = _ptArray.map(pt => {
			return { x: pt.x / sheetWidth - 0.5, y: (sheetHeight - pt.y) / sheetHeight - 0.5 }
		})

		curve.curves = []
		curve.currentPoint.set(0, 0)
		drawBezierCurve(curve, clipPtArray, sheetWidth, sheetHeight);
		_lineGeometry.current.setFromPoints(curve.getPoints(50))

		_meshGeometry.current.updateShape(curve)
		_prevCenter.copy(shapeCenter)
		shape.needsUpdated = false;
	})

  return (
		<group>
			<mesh>
				<stioShapeGeometry ref={_meshGeometry} attach="geometry" args={[curve]} />
				<meshBasicMaterial attach="material" color={color} transparent opacity={0.3} />
			</mesh>
			<mesh ref={_text} onUpdate={onTextUpdate} visible={!!label}>
				<textGeometry args={[label, { font, size: textSize, height: 1 }]}/>
				<meshLambertMaterial attach='material' color={'black'}/>
			</mesh>
			<line ref={_line}>
				<bufferGeometry ref={_lineGeometry} attach="geometry" onUpdate={onUpdateLine} />
				<lineBasicMaterial attach="material" color={color} linewidth={10} linecap={'round'} linejoin={'round'} />
			</line>
			<DragHandles selected={selected} points={points.slice(0, 4)} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</group>
  )
}

export default CloudLinkShape;