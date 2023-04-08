const uuid = require("uuid").v4;
import Point from "../geometry/point";
import Polygon from "../geometry/polygon";

import { getDrawingSizes, getTolerances, hoverTolerance } from "../config/sizes";

const WIDTH = 180;
const HALF_WIDTH = WIDTH / 2;
const HEIGHT = WIDTH * 2/3;
const HALF_HEIGHT = HEIGHT / 2;

class CameraShape {
	constructor(id, shapeData, metaData) {
		this.constructorName = "CameraShape";
		
		if (!id || !shapeData || !metaData) {
			this.id = uuid();
			this.published = false;
			this.poly = new Polygon();
			this.color = 0xff0000;
			this.title = "";
			this.photoIds = [];
		} else {
			this.id = id;
			this.published = !!metaData.published;
			this.poly = new Polygon();
			this.color = shapeData.color || 0xff0000;
			this.title = shapeData.title || "";
			this.photoIds = shapeData.photoIds || [];
			
			const pt = shapeData.poly.ptArray[0];
			this.poly.addPoint(new Point(pt.x, pt.y))
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
		const shouldPersist = true;
		this.needsUpdated = true;
		return shouldPersist;
	}

	move(dx, dy) {
		this.poly.shiftBy(dx, dy)
		this.needsUpdated = true;
	}

	isDragHandleHovered(pt, scale=1, isTouch) {
		const { corner } = getTolerances(isTouch, scale)
		const tolerance2 = corner * corner;
		const center = this.poly.first();
		const corners = [[HALF_WIDTH, HALF_HEIGHT], [HALF_WIDTH, -HALF_HEIGHT], [-HALF_WIDTH, -HALF_HEIGHT], [-HALF_WIDTH, HALF_HEIGHT]].map(([x, y]) => (
			{x: center.x + x, y: center.y + y}
		))
		return corners.findIndex(_pt => (
			(_pt.x - pt.x) * (_pt.x - pt.x) + (_pt.y - pt.y) * (_pt.y - pt.y) < tolerance2
		))
	}

	isHovered(pt, scale=1, isTouch) {
		const { corner } = getTolerances(isTouch, scale)
		const tolerance2 = corner * corner;
		const ctr = this.poly.first();
		return ctr.distance2(pt) < tolerance2;
	}
}

export default CameraShape

