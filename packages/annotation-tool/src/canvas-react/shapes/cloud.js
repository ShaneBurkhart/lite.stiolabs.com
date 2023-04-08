const uuid = require("uuid").v4;
import Polygon from "../geometry/polygon"
import Point from "../geometry/point"

import { getDesaturated } from "../config/colors";
import { getDrawingSizes, getTolerances, MIN_AREA_THRESHOLD } from "../config/sizes"
import { SHOW_MOUSE_AREAS, SHOW_TOUCH_AREAS } from "../config/debug";

class CloudShape {
  constructor(id, shapeData, metaData) {
		this.constructorName = "CloudShape";
		
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

		this._getBoundaryPoints = (isTouch, scale=1) => {
			const { bezierWidth, strokeWidth } = getDrawingSizes(isTouch, scale)
			var poly = this.poly.ptArray
			const bounds = poly.map(pt => pt.clone())

			if (bounds[0].x > bounds[1].x) {
				bounds[0].x += bezierWidth
				bounds[1].x -= bezierWidth
				bounds[2].x -= bezierWidth
				bounds[3].x += bezierWidth
			} else {
				bounds[0].x -= bezierWidth
				bounds[1].x += bezierWidth
				bounds[2].x += bezierWidth
				bounds[3].x -= bezierWidth
			}

			if (bounds[0].y > bounds[3].y) {
				bounds[0].y += bezierWidth
				bounds[1].y += bezierWidth
				bounds[2].y -= bezierWidth
				bounds[3].y -= bezierWidth
			} else {
				bounds[0].y -= bezierWidth
				bounds[1].y -= bezierWidth
				bounds[2].y += bezierWidth
				bounds[3].y += bezierWidth
			}
			// bounds.push(new Point(poly[0].x - bezierWidth, poly[0].y - bezierWidth))
			// bounds.push(new Point(poly[1].x + bezierWidth, poly[1].y - bezierWidth))
			// bounds.push(new Point(poly[2].x + bezierWidth, poly[2].y + bezierWidth))
			// bounds.push(new Point(poly[3].x - bezierWidth, poly[3].y + bezierWidth))

			return bounds
		}
	}

	toJSON() {
		const { id, published, poly, color } = this;
		return { 
			id,
			metaData: { published },
			shapeData: { poly, color },
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
		this.needsUpdated = true;
		
		return shouldPersist;
	}

	move(dx, dy) {
		this.poly.shiftBy(dx, dy)
		this.needsUpdated = true;
	}

	isDragHandleHovered(pt, scale, isTouch) {
		const { corner } = getTolerances(isTouch, scale)
		const tolerance2 = corner * corner
		return this._getBoundaryPoints(isTouch, scale).findIndex(t => t.distance2(pt) < tolerance2)
	}

	isHovered(pt, scale, isTouch) {
		const { hover } = getTolerances(isTouch, scale)
		const tolerance2 = hover * hover

		const isHovered = [this.poly.ptArray, this._getBoundaryPoints(isTouch, scale)].findIndex(points => {
			const line1 = new Polygon();
			line1.addPoint(points[0]);
			line1.addPoint(points[1]);

			const line2 = new Polygon();
			line2.addPoint(points[1]);
			line2.addPoint(points[2]);

			const line3 = new Polygon();
			line3.addPoint(points[2]);
			line3.addPoint(points[3]);

			const line4 = new Polygon();
			line4.addPoint(points[3]);
			line4.addPoint(points[0]);

			return line1.distance2(pt) < tolerance2 || line2.distance2(pt) < tolerance2 || line3.distance2(pt) < tolerance2 || line4.distance2(pt) < tolerance2
		})

		return isHovered !== -1
	}
}

export default CloudShape