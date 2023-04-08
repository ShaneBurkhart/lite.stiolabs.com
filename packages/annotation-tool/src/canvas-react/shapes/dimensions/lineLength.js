import LineShape from '../line'
import { getDrawingSizes } from "../../config/sizes"

class LineLengthShape extends LineShape {
	constructor(...args) {
		super(...args);
		this.constructorName = 'LineLengthShape';
	}

	getLengthText(scale=1, units='ft') {
		const feetLength = Math.round(this.poly.getLength() / scale * 100) / 100;
		const feet = Math.floor(feetLength)
		const inches = Math.floor((feetLength - feet) * 12);

		return `${feet}' ${inches}"`
	}
}

export default LineLengthShape

