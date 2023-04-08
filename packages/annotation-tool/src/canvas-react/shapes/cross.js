const uuid = require("uuid").v4;
import Polygon from "../geometry/polygon";
import Point from "../geometry/point";

import { getDesaturated } from "../config/colors";
import { getDrawingSizes, getTolerances, MIN_AREA_THRESHOLD } from "../config/sizes";
import { SHOW_TOUCH_AREAS, SHOW_MOUSE_AREAS } from "../config/debug";

class CrossShape {
	constructor(id, shapeData, metaData) {
		this.constructorName = "CrossShape";

		if (!id || !shapeData || !metaData) {
			this.id = uuid();
			this.published = false;
			this.poly = new Polygon();
			this.color = 0xff0000;
		} else {
			this.id = id;
			this.published = !!metaData.published;
			this.poly = new Polygon();
			this.color = shapeData.color || 0xff0000;
			
			const ptArray = (shapeData.poly || {}).ptArray || [];
			ptArray.forEach(pt => this.poly.addPoint(new Point(pt.x, pt.y)))
		}
  }

	toJSON() {
		const { id, published, ...shapeData } = this;
		return { 
			id,
			metaData: { published },
			shapeData,
		}
	}

	startDraw(pt) {
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
		const area = this.poly.getArea();
		const shouldPersist = area > MIN_AREA_THRESHOLD;
		
		return shouldPersist;
		this.needsUpdated = true;
	}

	move(dx, dy) {
		this.poly.shiftBy(dx, dy)
		this.needsUpdated = true;
	}

	isDragHandleHovered(pt, scale=1, isTouch) {
		const { corner } = getTolerances(isTouch, scale)
		const tolerance2 = corner * corner
		return this.poly.ptArray.findIndex(t => t.distance2(pt) < tolerance2)
	}

	isHovered(pt, scale=1, isTouch) {
		const { hover } = getTolerances(isTouch, scale)
		const tolerance2 = hover * hover

		var line1 = new Polygon();
		line1.addPoint(this.poly.first());
		line1.addPoint(this.poly.third());

		var line2 = new Polygon();
		line2.addPoint(this.poly.second());
		line2.addPoint(this.poly.fourth());

		if (line1.distance2(pt) < tolerance2 || line2.distance2(pt) < tolerance2) {
			return true;
		}
	}
}

export default CrossShape


