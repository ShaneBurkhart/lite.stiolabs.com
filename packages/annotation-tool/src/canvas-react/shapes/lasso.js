import Polygon from "../geometry/polygon";
import { hoverTolerance, strokeWidth, MIN_LENGTH_THRESHOLD  } from "../config/sizes";

class LassoShape {
	constructor() {
		this.constructorName = "LassoShape";
		
		this.poly = new Polygon();
		this.color = 0x5CEEEE;
		this.isLineCompleted = false;
	}

	stopDraw(){
		this.poly.smooth();
		this.isLineCompleted = true;
		
		const length = this.poly.getLength();
		const meetsTolerance = length > MIN_LENGTH_THRESHOLD;
		
		return meetsTolerance;
	}
	
	startDraw(pt) {
		this.poly.addPoint(pt.clone());
		this.needsUpdated = true;
	}
	
	updateDraw(pt) {
		this.poly.smooth();
		if (this.isLineCompleted) return;
    this.poly.addPoint(pt.clone());
		this.needsUpdated = true;
	}

	move(dx, dy) {
		this.poly.shiftBy(dx, dy)
	}


	isHovered() { return false }
	isDragHandleHovered() { return false }
}

export default LassoShape
