import * as THREE from "three";

export const TEXT_SIZE = 40;

export const hashPoints = (points) => {
	let hash = "";
	points.forEach(pt => {
		hash += pt.x + ',' + pt.y + ','
	})
	return hash;
}

export const ptToThreeVector = (pt, sheetWidth, sheetHeight, containerSize) => {
	containerSize = containerSize || { width: 1, height: 1 };
	const { x, y } = pt;
	return new THREE.Vector3((x / sheetWidth - 0.5) * containerSize.width, ((sheetHeight - y) / sheetHeight - 0.5) * containerSize.height, 0);
}

export const ptToWorldPt = (pt, sheetWidth, sheetHeight, containerSize) => {
	containerSize = containerSize || { width: 1, height: 1 };
	pt.x = (pt.x / sheetWidth - 0.5) * containerSize.width;
	pt.y = ((sheetHeight - pt.y) / sheetHeight - 0.5) * containerSize.height;
}

export const getWorldPt = (pt, sheetWidth, sheetHeight, containerSize) => {
	containerSize = containerSize || { width: 1, height: 1 };
	const x = (pt.x / sheetWidth - 0.5) * containerSize.width;
	const y = ((sheetHeight - pt.y) / sheetHeight - 0.5) * containerSize.height;
	return {x, y};
}

export const getTextOffsets = (textGeometry, offsetPt) => {
	if (!textGeometry) return [0,0];
	const offset = offsetPt || new THREE.Vector3();
	textGeometry.computeBoundingBox();
	textGeometry.boundingBox.getCenter(offset);
	return [offset.x, offset.y];
}

export const containerSize = { width: 1, height: 1 };

export const DRAG_HANDLE_RADIUS = 25;

export const BEZIER_WIDTH = 25;

export const updatePoints = (pts, _ptArray, sheetWidth, sheetHeight, _bezierWidth=0) => {
	const pt1 = { x: _ptArray[0].x, y: _ptArray[0].y };
	const pt2 = { x: _ptArray[1].x, y: _ptArray[1].y };
	const pt3 = { x: _ptArray[2].x, y: _ptArray[2].y };
	const pt4 = {	x: _ptArray[3].x, y: _ptArray[3].y };

	if (pt1.x > pt2.x) {
		pt1.x += _bezierWidth
		pt2.x -= _bezierWidth
		pt3.x -= _bezierWidth
		pt4.x += _bezierWidth
	} else {
		pt1.x -= _bezierWidth
		pt2.x += _bezierWidth
		pt3.x += _bezierWidth
		pt4.x -= _bezierWidth
	}

	if (pt1.y > pt4.y) {
		pt1.y += _bezierWidth
		pt2.y += _bezierWidth
		pt3.y -= _bezierWidth
		pt4.y -= _bezierWidth
	} else {
		pt1.y -= _bezierWidth
		pt2.y -= _bezierWidth
		pt3.y += _bezierWidth
		pt4.y += _bezierWidth
	}

	// const points = [pt1, pt2, pt3, pt4].map(pt => (
		// new THREE.Vector3(pt.x / sheetWidth - 0.5, (sheetHeight - pt.y) / sheetHeight - 0.5, 0)
	// ));
	[pt1, pt2, pt3, pt4].forEach((pt, idx) => {
		const { x, y } = getWorldPt(pt, sheetWidth, sheetHeight, containerSize);
		pts[idx].set(x, y, 0);
	})
}

export const drawBezierCurve = (curve, ptArray, sheetWidth, sheetHeight) => {
	const _bezierWidth = BEZIER_WIDTH;
	const bezierWidth = _bezierWidth / sheetWidth;
	var xLen = Math.abs(ptArray[0].x - ptArray[2].x);
	var xNum = Math.max(1, xLen / bezierWidth / 2) | 0;
	var yLen = Math.abs(ptArray[0].y - ptArray[2].y);
	var yNum = Math.max(1, yLen / bezierWidth / 2) | 0;
	var dx = (ptArray[1].x - ptArray[0].x) / xNum;
	var factor = 1;

	if (ptArray[0].y - ptArray[2].y > 0) factor = -1;

	for (var i = 0; i < xNum; i++) {
		// region.beginPath()
		curve.moveTo(ptArray[0].x + dx * i, ptArray[0].y);
		curve.bezierCurveTo(
			ptArray[0].x + dx * i,
			ptArray[0].y - factor * bezierWidth,
			ptArray[0].x + dx * (i + 1),
			ptArray[0].y - factor * bezierWidth,
			ptArray[0].x + dx * (i + 1),
			ptArray[0].y
		);
	}

	var dy = (ptArray[2].y - ptArray[1].y) / yNum;
	factor = 1;
	if (ptArray[0].x - ptArray[2].x > 0) factor = -1;
	for (i = 0; i < yNum; i++) {
		curve.moveTo(ptArray[1].x, ptArray[1].y + dy * i);
		curve.bezierCurveTo(
			ptArray[1].x + factor * bezierWidth,
			ptArray[1].y + dy * i,
			ptArray[1].x + factor * bezierWidth,
			ptArray[1].y + dy * (i + 1),
			ptArray[1].x,
			ptArray[1].y + dy * (i + 1)
		);
	}
	dx = (ptArray[3].x - ptArray[2].x) / xNum;
	factor = 1;
	if (ptArray[0].y - ptArray[2].y > 0) factor = -1;
	for (i = 0; i < xNum; i++) {
		curve.moveTo(ptArray[2].x + dx * i, ptArray[2].y);
		curve.bezierCurveTo(
			ptArray[2].x + dx * i,
			ptArray[2].y + factor * bezierWidth,
			ptArray[2].x + dx * (i + 1),
			ptArray[2].y + factor * bezierWidth,
			ptArray[2].x + dx * (i + 1),
			ptArray[2].y
		);
	}
	dy = (ptArray[0].y - ptArray[3].y) / yNum;
	factor = 1;
	if (ptArray[0].x - ptArray[2].x > 0) factor = -1;
	for (i = 0; i < yNum; i++) {
		curve.moveTo(ptArray[3].x, ptArray[3].y + dy * i);
		curve.bezierCurveTo(
			ptArray[3].x - factor * bezierWidth,
			ptArray[3].y + dy * i,
			ptArray[3].x - factor * bezierWidth,
			ptArray[3].y + dy * (i + 1),
			ptArray[3].x,
			ptArray[3].y + dy * (i + 1)
		);
	}
}