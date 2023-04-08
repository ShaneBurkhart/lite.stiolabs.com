import PenShape from '../pen'
import { getDrawingSizes } from "../../config/sizes"

class SplineAreaShape extends PenShape {
	constructor(...args) {
		super(...args);
		this.constructorName = 'SplineAreaShape';
	}

	getAreaText(scale=1, units='ft') {
		const area = Math.round(this.poly.getArea() / scale / scale * 100, 2) / 100;
		const feet = Math.floor(area)
		const inches = Math.floor((area - feet) * 12 );

		return `${feet}' ${inches}"`
	}
}

export default SplineAreaShape
