import React, { useContext, useCallback, useState, useRef, useEffect, useMemo, } from "react";
import _ from "underscore";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { DRAG_HANDLE_RADIUS } from "./utils";

const DragHandle = ({ point, curve }) => {
	const _mesh = useRef(null);
	const prevPoint = useRef({ x: point.x, y: point.y }).current;
	
	useFrame((state) => {
		if (!_mesh.current) return;
		if (point.x === prevPoint.x && point.y === prevPoint.y) return;
		const pointOffset = {x: point.x - prevPoint.x, y: point.y - prevPoint.y};
		if (pointOffset.x) _mesh.current.translateX(pointOffset.x);
		if (pointOffset.y) _mesh.current.translateY(pointOffset.y);
		
		prevPoint.x = point.x;
		prevPoint.y = point.y;
	})

	return (
		<mesh ref={_mesh} >
			<shapeBufferGeometry attach="geometry" args={[curve]} />
			<meshBasicMaterial attach="material" color={'#9c88ff'} />
		</mesh>
	)
}

const DragHandles = ({ points, selected, sheetWidth, sheetHeight }) => {
	const curves = useMemo(() => {
		if (!selected) return [];
		
		const radius = { x: DRAG_HANDLE_RADIUS / sheetWidth, y: DRAG_HANDLE_RADIUS / sheetHeight }
		const _curves = points.map(pt => {
			const _curve = new THREE.Shape();
			_curve.absellipse(pt.x, pt.y, radius.x, radius.y, 0, 2 * Math.PI, false, 0);
			return _curve;
		})

		return _curves;
	}, [selected]) // selected essentially forces to re-run each time, if we can figure out how to update the curve shape in place we can just create once and reuse

	const _points = points.filter(pt => !!pt.isVector3); // could maybe also be Vector2?
	if (!_points.length === points.length) console.warn('DragHandles: points are not all Vector3')
	return (
		<group>
			{!!selected && _points.map((pt, i) => (
				<DragHandle
					key={i}
					point={pt}
					curve={curves[i]}
					sheetWidth={sheetWidth}
					sheetHeight={sheetHeight}
				/>
			))}
		</group>
	)
}

export default DragHandles;