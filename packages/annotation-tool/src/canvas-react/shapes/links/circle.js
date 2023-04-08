import CircleShape from '../circle'
import Rectangle from "../../geometry/rectangle";
import { dimensionTextSize,  getTolerances } from "../../config/sizes"


class CircleLinkShape extends CircleShape {
	constructor(id, shapeData, metaData) {
		super(id, shapeData, metaData);
		this.constructorName = 'CircleLinkShape';

		if (!id || !shapeData || !metaData) {
			this.linkType = 'sheet';
			this.linkRef = '';
			this.label = '';
			this.note = '';
			this.showBorder = false;
		} else {
			this.linkType = shapeData.linkType || 'sheet';
			this.linkRef = shapeData.linkRef || '';
			this.label = shapeData.label || '';
			this.note = shapeData.note || '';
			this.showBorder = shapeData.showBorder || false;
		}
	}

	toJSON() {
		const { id, published, poly, color, linkType, linkRef, label, note, showBorder } = this;
		return { 
			id,
			metaData: { published },
			shapeData: { poly, color, linkType, linkRef, label, note, showBorder },
		}
	}

	isHovered(pt, scale=1, isTouch) {
		const { hover } = getTolerances(isTouch, scale)

		var cx = (this.poly.first().x + this.poly.third().x) / 2;
		var cy = (this.poly.first().y + this.poly.third().y) / 2;
		var a2 = (this.poly.third().x - cx) * (this.poly.third().x - cx);
		var b2 = (this.poly.third().y - cy) * (this.poly.third().y - cy);
		var r2 = (pt.x - cx) * (pt.x - cx) + (pt.y - cy) * (pt.y - cy);
		
		var cos2A = ((pt.x - cx) * (pt.x - cx)) / r2;
		var sin2A = 1 - cos2A;
		
		var R2 = (a2 * b2) / (b2 * cos2A + a2 * sin2A);
		
		return r2 < R2 + hover;
	}
}

export default CircleLinkShape