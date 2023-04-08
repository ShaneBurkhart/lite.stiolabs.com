import Point from "../geometry/point";
import Polygon from "../geometry/polygon";

import { getDrawingSizes, getTolerances } from "../config/sizes";

// a 'guiding' line segment that is used as a helper when drawing a polyline
class TmpLineShape {
	constructor() {
    this.poly = new Polygon();
    this.color = 0xff0000;
    this.alpha = 0.5;
		this.constructorName = "TmpLineShape";
  }

	startDraw(pt) {
    this.poly.addPoint(pt.clone());
	}

	updateDraw(pt) {
		const newPoint = pt.clone();

		this.poly.addPoint(newPoint);
	}

	stopDraw(pt) {
		const shouldPersist = false;
		
		return shouldPersist;
	}

	move(dx, dy) {
		this.poly.shiftBy(dx, dy)
	}

	movePoint(ptIdx, dx, dy) {
		this.poly.shiftPointAt(ptIdx, dx, dy)
	}
	
	draw(ctx, scale=1, props) {
		const { strokeWidth } = getDrawingSizes(props.isNative, scale);

		const ptArray = this.poly.ptArray;

		let color = this.color || 0xff0000;

		ctx.lineStyle(strokeWidth, color, this.alpha);
		if (this.poly.ptArray?.length) {
			ctx.moveTo(ptArray[0].x, ptArray[0].y);
			ptArray.forEach(pt => ctx.lineTo(pt.x, pt.y));
		}

    const lastPoint = this.poly.last();

		ctx.drawCircle(lastPoint.x, lastPoint.y, strokeWidth);
	}

	drawBounds(ctx, scale=1, props) {
  }

	drawDebug(ctx, scale=1, props) {
	}
}

export default TmpLineShape;
