import CloudShape from '../cloud'
import Rectangle from '../../geometry/rectangle'
import { dimensionTextSize, hoverTolerance } from "../../config/sizes"


class CloudLinkShape extends CloudShape {
	constructor(id, shapeData, metaData) {
		super(id, shapeData, metaData);
		this.constructorName = 'CloudLinkShape';
		
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

	isHovered(pt, scale=1) {
		const rect = new Rectangle()
		rect.extendArray(this.poly.ptArray)

		const tolerance = hoverTolerance * scale
		return rect.contains(pt, tolerance)
	}
}

export default CloudLinkShape