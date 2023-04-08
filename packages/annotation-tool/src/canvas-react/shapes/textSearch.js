import RectangleLinkShape from "./links/rectangle"

class TextSearchShape extends RectangleLinkShape {
	constructor(id, shapeData, options) {
		super(id, shapeData, options)
		this.constructorName = 'TextSearchShape'
	}
}

export default TextSearchShape