const uuid = require("uuid").v4;
import Polygon from "../geometry/polygon";
import Point from "../geometry/point";
import { calculateBoundaryForPoints } from "../geometry/measure";

import { getDesaturated } from "../config/colors";
import { getTolerances,  MIN_LENGTH_THRESHOLD } from "../config/sizes";

class PenShape {
	constructor(id, shapeData, metaData) {
		this.constructorName = "PenShape";
		
		if (!id || !shapeData || !metaData) {
			this.id = uuid();
			this.published = false;
			this.poly = new Polygon();
			this.color = 0xff0000;
			this.isLineCompleted = false;
		} else {
			this.id = id;
			this.published = !!metaData.published;
			this.poly = new Polygon();
			this.color = shapeData.color || 0xff0000;
			this.isLineCompleted = !!shapeData.isLineCompleted;
			
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
	}

	updateDraw(pt) {
		if (this.isLineCompleted) return;
    this.poly.addPoint(pt.clone());
		this.needsUpdated = true;
	}

	stopDraw(pt) {
		this.poly.smooth();
		this.isLineCompleted = true;
		
		const length = this.poly.getLength();
		const shouldPersist = length > MIN_LENGTH_THRESHOLD;
		this.needsUpdated = true;
		
		return shouldPersist;
	}

	move(dx, dy) {
		this.poly.shiftBy(dx, dy)
		this.needsUpdated = true;
	}

	isDragHandleHovered(pt, scale=1) {
		return -1
	}

	isHovered(pt, scale=1, isTouch) {
		const { hover } = getTolerances(isTouch, scale)
		const tolerance = hover * scale
		const tolerance2 = tolerance * tolerance
		if (this.poly.distance2(pt) < tolerance2) return true
	}
}

export default PenShape
