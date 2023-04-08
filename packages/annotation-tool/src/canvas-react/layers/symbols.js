import Coords from "../geometry/coords"
import Point from "../geometry/point"

import CloudShape from "../shapes/cloud"
import ArrowShape from "../shapes/arrow"
import RectangleShape from "../shapes/rectangle"
import CrossShape from "../shapes/cross"
import LineShape from "../shapes/line"
import CircleShape from "../shapes/circle"
import PenShape from "../shapes/pen"
import HighlightShape from "../shapes/highlight"
import TextShape from "../shapes/text"
import CameraShape from "../shapes/camera"
import StampShape from "../shapes/stamp"

import CloudLinkShape from "../shapes/links/cloud"
import CircleLinkShape from "../shapes/links/circle"
import RectangleLinkShape from "../shapes/links/rectangle"

const DIMENSION_TOOL_NAMES = [
	"CalibrationShape", "LineLengthShape", "RectangleAreaShape", "SplineLengthShape", "SplineAreaShape"
]

const TOOLS = [
	"cloud", 
	"arrow", 
	"pen",
	"highlight",
	"text", "camera", "stamp",
	"rectangle", "circle", "line", "cross",
	"cloud-link", "circle-link", "rectangle-link",
]

const SHAPE_FOR_TOOL = {
	"cloud": CloudShape,
	"arrow": ArrowShape,
	"rectangle": RectangleShape,
	"cross": CrossShape,
	"line": LineShape,
	"circle": CircleShape,
	"pen": PenShape,
	"highlight": HighlightShape,
	"text": TextShape,
	"camera": CameraShape,
	"cloud-link": CloudLinkShape,
	"circle-link": CircleLinkShape,
	"rectangle-link": RectangleLinkShape,
	"stamp": StampShape,
}

class SymbolsCanvas {
	constructor(shapes) {
		this._shapeBeingDrawn = null
		this._shapeOnMouseDown = null
		this._mouseDownPos = null

		this.scale = 1
	}

	onMouseDown = (e, hoveredShapes, extras) => {
		const { containerSize, mapPos, selectedTool, selectedColor, selectedStampKey, setShapeBeingDragged, setShapeBeingDrawn, setCursor } = this.props
		const { selectedShapesHovered, visibleShapesHovered } = hoveredShapes;
		const { docPt } = extras;
		
		if (!TOOLS.includes(selectedTool)) return;

		const shape = SHAPE_FOR_TOOL[selectedTool]

		if (!!shape) {
			this._shapeBeingDrawn = new shape();
			this._shapeBeingDrawn.color = selectedColor;
			
			if (selectedTool === "stamp" && !!selectedStampKey){
				this._shapeBeingDrawn.stampKey = selectedStampKey;
			} 
			
			setShapeBeingDragged(this._shapeBeingDrawn);
			setShapeBeingDrawn(this._shapeBeingDrawn);
		}

		setCursor('pointer');

		this._shapeBeingDrawn.startDraw(docPt);
	}

	onMouseMove = (e, hoveredShapes, extras) => {
		const { visibleShapes, selectedTool, mapPos, setCursor } = this.props
		const { docPt } = extras;

		if (!TOOLS.includes(selectedTool)) return;

		setCursor('pointer');

		if (!!this._shapeBeingDrawn) {
			setCursor('grabbing')

			this._shapeBeingDrawn.updateDraw(docPt);
		} else if (visibleShapes.find(shape => shape.isHovered(docPt, mapPos.scale, false))) {
			setCursor('pointer')
		}
	}

	onMouseUp = (e, hoveredShapes, extras) => {
		const { containerSize, selectedTool, mapPos, setCursor, addShapes, onShapeCreated, onShapesUpdated, setShapeBeingDragged, setShapeBeingDrawn } = this.props
		const { docPt } = extras;

		if (!TOOLS.includes(selectedTool) || !this._shapeBeingDrawn) return;

		var shouldPersistShape = this._shapeBeingDrawn.stopDraw();
		
		if (shouldPersistShape) {
			addShapes([ this._shapeBeingDrawn ]);
			onShapeCreated(this._shapeBeingDrawn);
		}

		this._shapeBeingDrawn = null;

		setShapeBeingDragged(null);
		setShapeBeingDrawn(null);
		setCursor('pointer');
	}

	onMouseLeave = (e, hoveredShapes, extras) => {
		this.onMouseUp(e, hoveredShapes, extras)
	}

	onTouchStart = (e, hoveredShapes, extras) => {
		const { selectedTool, selectedStampKey, selectedColor, mapPos, setCursor, setShapeBeingDragged, setShapeBeingDrawn } = this.props
		const { docPt } = extras;

		const shape = SHAPE_FOR_TOOL[selectedTool]
		if (shape) {
			this._shapeBeingDrawn = new shape()
			this._shapeBeingDrawn.color = selectedColor 
			if (selectedTool === "stamp" && !!selectedStampKey) this._shapeBeingDrawn.stampKey = selectedStampKey;

			setShapeBeingDragged(this._shapeBeingDrawn)
			setShapeBeingDrawn(this._shapeBeingDrawn)
		}

		if (TOOLS.includes(selectedTool)) {
			setCursor('pointer')

			this._shapeBeingDrawn.startDraw(docPt)
		}
	}

	onTouchMove = (e) => {
		const { visibleShapes, containerSize, selectedTool, mapPos, setCursor, sheet } = this.props

		const touch = e.nativeEvent.touches[0]
		const docPt = new Point(
			touch.locationX * sheet.width / containerSize.width,
			touch.locationY * sheet.height / containerSize.height,
		)

		if (TOOLS.includes(selectedTool)) setCursor('pointer')

		if (TOOLS.includes(selectedTool) && this._shapeBeingDrawn) {
			setCursor('grabbing')

			this._shapeBeingDrawn.updateDraw(docPt)
		} else if (visibleShapes.find(shape => shape.isHovered(docPt, mapPos.scale, true))) {
			setCursor('pointer')
		}
	}

	onTouchEnd = (e, hoveredShapes, extras) => { 
		const { sheet, containerSize, selectedTool, redraw, mapPos, setCursor, addShapes, onShapeCreated, setShapeBeingDragged, setShapeBeingDrawn } = this.props
		const { docPt } = extras;

		if (TOOLS.includes(selectedTool) && this._shapeBeingDrawn) {
			var shouldPersistShape = this._shapeBeingDrawn.stopDraw()
			
			if (shouldPersistShape) {
				addShapes([ this._shapeBeingDrawn ])
				onShapeCreated(this._shapeBeingDrawn)
			}

			this._shapeBeingDrawn = null;

			setShapeBeingDragged(null)
			setShapeBeingDrawn(null)
			setCursor('pointer')
		}
	}

	setProps(props) {
		this.props = props
	}
}

export default SymbolsCanvas