import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import DragHandles from './DragHandles'
import { BEZIER_WIDTH, updatePoints, drawBezierCurve, containerSize } from './utils'

const CloudShape = ({ selected, shape, color, sheetWidth, sheetHeight }) => {
	const _ptArray = shape.poly.ptArray;
	const _line = useRef(null)
	const _lineGeometry = useRef(null)

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

		return [points, curve];
	}, [])

  const onUpdate = useCallback((self) => {
		self.setFromPoints(curve.getPoints(50))
	}, [])

	useFrame((state) => {
		if (!shape.needsUpdated) return;
		shape.needsUpdated = false;
		
		updatePoints(points, _ptArray, sheetWidth, sheetHeight, BEZIER_WIDTH);

		const clipPtArray = _ptArray.map(pt => {
			return { x: pt.x / sheetWidth - 0.5, y: (sheetHeight - pt.y) / sheetHeight - 0.5 }
		})
		curve.curves = []
		curve.currentPoint.set(0, 0)
		drawBezierCurve(curve, clipPtArray, sheetWidth, sheetHeight);
		_lineGeometry.current.setFromPoints(curve.getPoints(50))
	})
  
	return (
		<group>
			<line ref={_line}>
				<bufferGeometry ref={_lineGeometry} attach="geometry" onUpdate={onUpdate} />
				<lineBasicMaterial attach="material" color={color} linewidth={3} linecap={'round'} linejoin={'round'} />
			</line>
			<DragHandles selected={selected} points={points.slice(0, 4)} sheetWidth={sheetWidth} sheetHeight={sheetHeight} />
		</group>
  )
}

export default CloudShape;
