const uuid = require("uuid").v4;
import Polygon from "../geometry/polygon"
import Point from "../geometry/point"

import { getDesaturated } from "../config/colors";
import { getDrawingSizes, getTolerances, dimensionTextSize } from "../config/sizes";


const RADIUS = 50;

class StampShape {
  constructor(id, shapeData, metaData, project) {
		this.constructorName = "StampShape";

		if (!id || !shapeData || !metaData) {
			this.id = uuid();
			this.published = false;
			this.poly = new Polygon();
			this.color = 0xff0000;
      this.stampKey = null;
			this.taskId = null;
			this.task = null;
		} else {
			this.id = id;
			this.published = !!metaData.published;
			this.poly = new Polygon();
			this.color = shapeData.color || 0xff0000;
      this.stampKey = shapeData.stampKey || shapeData.stampId || null;
      this.taskId = shapeData.taskId || null;
			this.task = (project.Tasks || []).find(task => task.id === this.taskId) || null;
			
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

	updateDraw(pt, dragHandleIndex=2) {
		this.move(pt.x - this.poly.first().x, pt.y - this.poly.first().y)
		this.needsUpdated = true;
	}

	stopDraw(pt) {
		const shouldPersist = true
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
		const { corner } = getTolerances(isTouch, scale)
		const tolerance2 = corner * corner;
		const ctr = this.poly.first();
		return ctr.distance2(pt) < tolerance2
	}
}

export default StampShape

