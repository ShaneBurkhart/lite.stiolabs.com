const uuid = require("uuid").v4;
const moment = require("moment");
import Point from "../geometry/point";
import Polygon from "../geometry/polygon";
import { getPhaseCode } from '../../workComplete/phaseCodes';
import { getDesaturated, hexNumsByName as HEXES } from "../config/colors";

import { getPolylineDrawingSizes, getPolylineTolerances } from "../config/sizes";

const SCALE = 1/16;

class PolylineShape {
	constructor(id, shapeData, metaData) {
		this.constructorName = 'PolylineShape';
		
		if (!id || !shapeData || !metaData) {
			this.id = uuid();
			this.published = false;
			this.poly = new Polygon();
			this.isComplete = false;
			this.isClosed = false;
			this.phaseCode = '';
			this.buildingArea = '';
			this.attrArray = [];
			this.scale = SCALE;
			this.customScaleDisplay = null;
			this.color = HEXES.red;
		} else {
			this.id = id;
			this.published = !!metaData.published;
			this.poly = new Polygon();
			this.isComplete = true;
			this.isClosed = shapeData.isClosed || false;
			this.phaseCode = shapeData.phaseCode || '';
			this.buildingArea = shapeData.buildingArea || '';
			this.attrArray = shapeData.attrArray || [];
			this.scale = shapeData.scale || SCALE;
			this.customScaleDisplay = shapeData.customScaleDisplay || null;
			this.color = getColor(shapeData.phaseCode || '');
			
			const ptArray = (shapeData.poly || {}).ptArray || [];
			ptArray.forEach(pt => this.poly.addPoint(new Point(pt.x, pt.y)))
		}
  }

	toJSON() {
		const { id, published, isComplete, ...shapeData } = this;
		return { 
			id,
			metaData: { published },
			shapeData,
		}
	}

	startDraw(pt, startPt, selectedAttributes={}) {
		if (startPt) this.poly.addPoint(startPt.clone());
		this.poly.addPoint(pt.clone());

		if (Object.keys(selectedAttributes).length !== 0) {
			const attr = { isComplete: true, completedAt: moment(), attributes: selectedAttributes }

			this.attrArray.push(attr);
		}

		this.needsUpdated = true;
	}

	updateDraw(pt, dragHandleIndex=1, selectedAttributes={}) {
		const newPoint = pt.clone();
		newPoint.assign(pt);

		const attr = { isComplete: true, completedAt: moment(), attributes: selectedAttributes }

		if (dragHandleIndex === 0 && this.poly.ptArray.length > 1) {
			this.poly.addPointToStart(newPoint);
			this.attrArray.unshift(attr);
		} else {
			this.poly.addPoint(newPoint);
			this.attrArray.push(attr);
		}

		this.needsUpdated = true;
	}

	movePt(pt, dragHandleIndex=2) {
		const dragPoint = this.poly.ptArray[dragHandleIndex]
    dragPoint.x = pt.x;
		dragPoint.y = pt.y;
		
		const shouldMoveClosedShapeJoint = this.isClosed && (dragHandleIndex === 0 || dragHandleIndex === this.poly.ptArray.length - 1);
		if (shouldMoveClosedShapeJoint) {
			const otherDragPoint = dragHandleIndex === 0 ? this.poly.ptArray[this.poly.ptArray.length - 1] : this.poly.ptArray[0];
			otherDragPoint.x = pt.x;
			otherDragPoint.y = pt.y;
		}

		this.needsUpdated = true;
	}

	stopDraw(pt) {
		const shouldPersist = true;
		this.needsUpdated = true;
		return shouldPersist;
	}

	move(dx, dy) {
		this.poly.shiftBy(dx, dy)
		this.needsUpdated = true;
	}

	isDragHandleHovered(pt, scale=1, isTouch) {
		const { dot } = getPolylineTolerances(isTouch, scale)
		const tolerance2 = dot * dot

		return this.poly.ptArray.findIndex(t => t.distance2(pt) < tolerance2)
	}

	isHovered(pt, scale=1, isTouch) {
		const { line } = getPolylineTolerances(isTouch, scale)
		const tolerance2 = line * line

		const firstPoint = this.poly.first();
		if (this.poly.ptArray.length === 1) {
			if (pt.distance2(firstPoint) < tolerance2) return [0];
			return null
		}

		for (let i = 0; i < this.poly.ptArray.length - 1; i++) {
			const line = new Polygon();
			line.addPoint(this.poly.ptArray[i]);
			line.addPoint(this.poly.ptArray[i + 1]);

			if (line.distance2(pt) < tolerance2) return [i, i + 1]
		}
		return null;
	}
	
	draw(ctx, scale=1, props) {
		const { selectedShapes, isNative } = props;
		const { strokeWidth } = getPolylineDrawingSizes(isNative, scale);
		const isSelected = (selectedShapes || []).map(s => s.id).includes(this.id);

		const firstPt = this.poly.first();
		const lastPt = this.poly.last();

		let color = getColor(this.phaseCode);
		if (selectedShapes.length && !isSelected) color = getDesaturated(color);

		// draw segments
		if (this.poly.ptArray.length) {
			if (this.isClosed) ctx.beginFill(color, .2);

			ctx.lineStyle(strokeWidth, color, 1);
			ctx.moveTo(firstPt.x, firstPt.y);

			this.poly.ptArray.forEach((pt, i) => {
				const isComplete = this.attrArray[i - 1]?.isComplete; // if the prev attr is complete, the line from prev pt to this pt is complete
				if (!isComplete) ctx.lineStyle(strokeWidth, color, .2);
				ctx.lineTo(pt.x, pt.y)
				ctx.lineStyle(strokeWidth, color, 1);
			});

			if (this.isClosed) ctx.endFill();
		}

		// draw points
		this.poly.ptArray.forEach(pt => {
			if (pt === firstPt || pt === lastPt) {
				drawEndPt(pt.x, pt.y, ctx, color, strokeWidth)
			} else {
				ctx.lineStyle(strokeWidth, color, 1);
				ctx.drawCircle(pt.x, pt.y, strokeWidth);
			}
		});
	}

	drawBounds(ctx, scale=1, props) {
		const { isClosedShapeOverlay } = props;
		const { strokeWidth } = getPolylineDrawingSizes(props.isNative, scale)

		let color = HEXES.blue;
		let lineWidth = strokeWidth / 2;
		
		if (isClosedShapeOverlay) {
			color = getDesaturated(getColor(this.phaseCode));
			lineWidth = strokeWidth;
		};

		ctx.lineStyle(lineWidth, color, 1);
		ctx.beginFill(color);

		this.poly.ptArray.forEach((pt) => {
			ctx.drawCircle(pt.x, pt.y, strokeWidth);
		})

		ctx.endFill()

		const firstPoint = this.poly.first();
		ctx.moveTo(firstPoint.x, firstPoint.y);

		if (isClosedShapeOverlay) ctx.beginFill(color, .2)
		this.poly.ptArray.forEach(pt => { ctx.lineTo(pt.x, pt.y); })
		if (isClosedShapeOverlay) {
			ctx.lineTo(firstPoint.x, firstPoint.y)
			ctx.endFill();
		};
	}
}

export const closePolyline = (polyline, selectedAttributes) => {
	if (polyline.isClosed || polyline.poly.ptArray.length < 3 || !selectedAttributes) return;
	polyline.updateDraw(polyline.poly.ptArray[0], 1, selectedAttributes);
	polyline.isClosed = true;
	polyline.isComplete = true;
	polyline.needsUpdated = true;
}

export const getColor = (phaseCode) => {
	let phaseCodeColor = 'red';
	if (phaseCode) phaseCodeColor = getPhaseCode(phaseCode)?.color || 'red';

	return HEXES[phaseCodeColor];
}

function drawEndPt(x, y, ctx, color, strokeWidth){
	ctx.lineStyle(strokeWidth * 1.5, color, 1);
	ctx.drawCircle(x, y, strokeWidth);
	ctx.lineStyle(strokeWidth * 1.25, color, .55);
	ctx.drawCircle(x, y, strokeWidth);
	ctx.lineStyle(strokeWidth / 1.25, HEXES.white_1, .65);
	ctx.drawCircle(x, y, strokeWidth / 1.25);
}

export default PolylineShape
