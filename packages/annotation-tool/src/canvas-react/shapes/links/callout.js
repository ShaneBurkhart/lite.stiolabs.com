import RectangleLinkShape from "./rectangle"

class CalloutShape extends RectangleLinkShape {
	constructor(id, shapeData, options) {
		super(id, shapeData, options)
		this.constructorName = 'CalloutShape'
	}
}

export default CalloutShape