import RectangleShape from '../rectangle'
import Rectangle from '../../geometry/rectangle'
import { getDrawingSizes, getTolerances } from "../../config/sizes"

class RectangleAreaShape extends RectangleShape {
	constructor(...args) {
		super(...args);
		this.constructorName = 'RectangleAreaShape';
	}

	isHovered(pt, scale=1, isTouch) {
		const { hover } = getTolerances(isTouch, scale)
		const rect = new Rectangle()
		rect.extendArray(this.poly.ptArray)

		const tolerance = hover
		return rect.contains(pt, tolerance)
	}

	getAreaText(scale=1, units='ft') {
		const area = Math.round(this.poly.getArea() / scale / scale * 100, 2) / 100;
		const feet = Math.floor(area)
		const inches = Math.floor((area - feet) * 12 );

		return `${feet}' ${inches}"`
	}
}

export default RectangleAreaShape