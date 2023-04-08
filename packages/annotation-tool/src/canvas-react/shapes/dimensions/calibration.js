import LineShape from '../line'
import { getDrawingSizes } from "../../config/sizes"

class CalibrationShape extends LineShape {
	constructor(id, shapeData, metaData) {
		super(id, shapeData, metaData);
		this.constructorName = "CalibrationShape";

		this.feet = shapeData?.feet || 6
		this.inches = shapeData?.inches || 0
		this.meters = null 

		this.unitScale = 1

		this.sheetDpi = 150

		this.calculateUnitScale();
	}

	stopDraw(pt) {
		const shouldPersist = super.stopDraw(pt);
		this.calculateUnitScale();
		
		return shouldPersist;
	}

	calculateUnitScale() {
		const docLength = Math.round(this.poly.getLength());

		// Calculate the scale for measuring. Always go to single unit
		// Metric will be 1m, imperial will be 1' for easy math
		if (this.meters === null) {
			// type check this.feet & this.inches
			const [_feet, _inches] = [this.feet, this.inches].map(unit => {
				if (typeof unit !== 'number') return isNaN(parseInt(unit, 10)) ? 0 : parseInt(unit, 10);
				return unit;
			});

			this.unitScale = docLength / (_feet + _inches / 12.0)
		} else {
			let _meters = this.meters;
			if (typeof _meters !== 'number') _meters = isNaN(parseInt(_meters, 10)) ? 0 : parseInt(_meters, 10);
			
			// 39.37 is inches / meter
			this.unitScale = docLength / 39.37 / _meters
		}
		return this.unitScale;
	}

	getLengthText(dimensionScale={}) {
		return this.meters === null ? `${this.feet}'-${this.inches}"` : `${this.meters}m`
	}
}

export default CalibrationShape


