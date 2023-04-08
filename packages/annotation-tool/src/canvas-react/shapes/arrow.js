const uuid = require("uuid").v4;
import Polygon from "../geometry/polygon";
import Point from "../geometry/point";
import { setBoundsStyle } from "../geometry/drawing";

import { getDesaturated } from "../config/colors";
import { getDrawingSizes, getTolerances, MIN_LENGTH_THRESHOLD } from "../config/sizes";
import { SHOW_TOUCH_AREAS, SHOW_MOUSE_AREAS } from "../config/debug";

class ArrowShape {
	constructor(id, shapeData, metaData) {
		this.constructorName = "ArrowShape";
		
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
	}

	updateDraw(pt, dragHandleIndex=1) {
    this.poly.ptArray[dragHandleIndex].x = pt.x;
    this.poly.ptArray[dragHandleIndex].y = pt.y;
		this.needsUpdated = true;
	}

	stopDraw(pt) {
		const length = this.poly.getLength();
		const shouldPersist = length > MIN_LENGTH_THRESHOLD;
		this.needsUpdated = true;
		
		return shouldPersist;
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

		const line1 = new Polygon();
		line1.addPoint(this.poly.first());
		line1.addPoint(this.poly.second());

		if (line1.distance2(pt) < tolerance2) return true
	}
}

export default ArrowShape
