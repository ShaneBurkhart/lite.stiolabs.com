const uuid = require("uuid").v4;
import Polygon from "../geometry/polygon";
import Point from "../geometry/point";
import Rectangle from "../geometry/rectangle";
import { getDesaturated } from "../config/colors";
import { getTolerances, MIN_AREA_THRESHOLD, } from "../config/sizes"

class TextShape {
  constructor(id, shapeData, metaData) {
		this.constructorName = "TextShape";

		if (!id || !shapeData || !metaData) {
			this.id = uuid();
			this.published = false;
			this.poly = new Polygon();
			this.color = 0xff0000;
			this.message = "Default Message";
			this.fontSize = 1.25;
			this.showBorder = false;
		} else {
			this.id = id;
			this.fontSize = shapeData.fontSize || 1.25;
			this.published = !!metaData.published;
			this.poly = new Polygon();
			this.color = shapeData.color || 0xff0000;
			this.message = shapeData.message || "";
			this.showBorder = shapeData.showBorder || false;
			
			const ptArray = (shapeData.poly || {}).ptArray || [];
			ptArray.forEach(pt => this.poly.addPoint(new Point(pt.x, pt.y)))
		}
		this._isDrawing = false //TODO: should we move this out like in Rectangle.js
  }

	toJSON() {
		const { id, published, text, _isDrawing, ...shapeData } = this;
		return { 
			id,
			metaData: { published },
			shapeData,
		}
	}

	startDraw(pt) {
		this._isDrawing = true
    this.poly.addPoint(pt.clone());
    this.poly.addPoint(pt.clone());
    this.poly.addPoint(pt.clone());
    this.poly.addPoint(pt.clone());
	}

	updateDraw(pt, dragHandleIndex=2) {
		const dragPoint = this.poly.ptArray[dragHandleIndex]
    dragPoint.x = pt.x;
		dragPoint.y = pt.y;
		
		const beforePtIndex = dragHandleIndex - 1 < 0 ? 3 : dragHandleIndex - 1;
		const afterPtIndex = dragHandleIndex + 1 > 3 ? 0 : dragHandleIndex + 1;
		if (dragHandleIndex === 0) {
			this.poly.ptArray[beforePtIndex].x = pt.x;
			this.poly.ptArray[afterPtIndex].y = pt.y;
		} else if (dragHandleIndex === 1) {
			this.poly.ptArray[beforePtIndex].y = pt.y;
			this.poly.ptArray[afterPtIndex].x = pt.x;
		} else if (dragHandleIndex === 2) {
			this.poly.ptArray[beforePtIndex].x = pt.x;
			this.poly.ptArray[afterPtIndex].y = pt.y;
		} else if (dragHandleIndex === 3) {
			this.poly.ptArray[beforePtIndex].y = pt.y;
			this.poly.ptArray[afterPtIndex].x = pt.x;
		}
		this.needsUpdated = true;
	}

	stopDraw(pt) {
		this._isDrawing = false
		
		const area = this.poly.getArea();
		const shouldPersist = area > MIN_AREA_THRESHOLD;
		this.needsUpdated = true;
		
		return shouldPersist;
	}

	move(dx, dy) {
		this.poly.shiftBy(dx, dy)
		this.needsUpdated = true;
	}

	isDragHandleHovered(pt, scale=1, isTouch) {
		const { corner } = getTolerances(isTouch, scale)
		const tolerance = corner * scale
		const tolerance2 = tolerance * tolerance
		return this.poly.ptArray.findIndex(t => t.distance2(pt) < tolerance2)
	}

	isHovered(pt, scale=1, isTouch) {
		const { hover } = getTolerances(isTouch, scale)
		const rect = new Rectangle()
		rect.extendArray(this.poly.ptArray)

		const tolerance = hover * scale
		return rect.contains(pt, tolerance)
	}
}

export default TextShape
