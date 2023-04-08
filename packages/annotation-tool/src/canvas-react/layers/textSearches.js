import Coords from "../geometry/coords";
import Point from "../geometry/point";
import { getTextSearchShapes } from "../../annotations/getTextSearchShapes";

// Is this where the text search shapes/highlights are created?

class TextSearchCanvas {
	constructor() {
		this._mouseDownPos = null
		this._lastTextSearchMatches = null;
	}

	onMouseDown = (e) => { }

	onMouseMove = (e) => { }

	onMouseUp = (e) => { }

	onMouseLeave = (e) => { }

	onTouchStart = (e) => { }

	onTouchMove = (e) => { }

	onTouchEnd = (e) => { }

	setProps(props) {
		this.props = props
	}
}

export default TextSearchCanvas
