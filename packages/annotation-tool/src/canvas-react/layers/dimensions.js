import Coords from "../geometry/coords"
import Point from "../geometry/point"

import LineLengthShape from "../shapes/dimensions/lineLength"
import RectangleAreaShape from "../shapes/dimensions/rectangleArea"
import SplineAreaShape from "../shapes/dimensions/splineArea"
import SplineLengthShape from "../shapes/dimensions/splineLength"
import CalibrationShape from "../shapes/dimensions/calibration"

const DIMENSION_TOOL_NAMES = [
	"CalibrationShape", "LineLengthShape", "RectangleAreaShape", "SplineLengthShape", "SplineAreaShape"
]

const TOOLS = [
	"calibration", "line-length", "rectangle-area", "spline-length", "spline-area"
]

const SHAPE_FOR_TOOL = {
	"calibration": CalibrationShape,
	"line-length": LineLengthShape,
	"rectangle-area": RectangleAreaShape,
	"spline-length": SplineLengthShape,
	"spline-area": SplineAreaShape,
}

class DimensionsCanvas {
	constructor(shapes) {
		this._shapeBeingDrawn = null
	}

	onMouseDown = (e, hoveredShapes, extras) => {
		const { selectedTool, selectedColor, setShapeBeingDragged, setShapeBeingDrawn } = this.props
		const { setCursor } = this.props
		const { docPt } = extras;

		const shape = SHAPE_FOR_TOOL[selectedTool]
		if (shape) {
			this._shapeBeingDrawn = new shape()
			this._shapeBeingDrawn.color = selectedColor 
			setShapeBeingDragged(this._shapeBeingDrawn)
			setShapeBeingDrawn(this._shapeBeingDrawn);
		}

		if (TOOLS.includes(selectedTool)) {
			setCursor('pointer')

			this._shapeBeingDrawn.startDraw(docPt)
		}
	}

	onMouseMove = (e, hoveredShapes, extras) => {
		const { visibleShapes, containerSize, selectedTool, mapPos } = this.props
		const { setCursor } = this.props
		const { docPt } = extras;

		if (TOOLS.includes(selectedTool)) setCursor('pointer')

		if (TOOLS.includes(selectedTool) && this._shapeBeingDrawn) {
			setCursor('grabbing')

			this._shapeBeingDrawn.updateDraw(docPt)
		} else if (visibleShapes.find(shape => shape.isHovered(docPt, mapPos.scale, false))) {
			setCursor('pointer')
		}
	}

	onMouseUp = (e, hoveredShapes, extras) => {
		const { allShapes, visibleShapes, containerSize, selectedTool, selectedShapes } = this.props
		const { mapPos, setCursor, deleteAnnotations, addShapes, onShapeCreated, setShapeBeingDragged, setShapeBeingDrawn } = this.props
		const { docPt } = extras;

		if (TOOLS.includes(selectedTool) && this._shapeBeingDrawn) {
			var shouldPersistShape = this._shapeBeingDrawn.stopDraw();

			if (shouldPersistShape) {
				if (this._shapeBeingDrawn.constructorName === "CalibrationShape") {
					const calibrationShapes = (allShapes || []).filter(shape => shape.constructorName === "CalibrationShape")
					deleteAnnotations(calibrationShapes)
				}
	
				onShapeCreated(this._shapeBeingDrawn)
			}
			// No need to redraw the entire canvas
			// drawShapes(this.getSymbolContext(), [ this._shapeBeingDrawn ])

			this._shapeBeingDrawn = null;

			setShapeBeingDragged(null)
			setShapeBeingDrawn(null)
			setCursor('pointer')
		}
	}

	onMouseLeave = (e, hoveredShapes, extras) => { this.onMouseUp(e, hoveredShapes, extras) }

	onTouchStart = (e, hoveredShapes, extras) => {
		const { selectedTool, selectedColor } = this.props
		const { setCursor, setShapeBeingDragged, setShapeBeingDrawn } = this.props
		const { docPt } = extras;

		const shape = SHAPE_FOR_TOOL[selectedTool]
		if (shape) {
			this._shapeBeingDrawn = new shape()
			this._shapeBeingDrawn.color = selectedColor 
			setShapeBeingDragged(this._shapeBeingDrawn)
			setShapeBeingDrawn(this._shapeBeingDrawn)
		}

		if (TOOLS.includes(selectedTool)) {
			setCursor('pointer')

			this._shapeBeingDrawn.startDraw(docPt)
		}
	}

	onTouchMove = (e) => {
		const { visibleShapes, containerSize, selectedTool, selectedShapes } = this.props
		const { sheet, mapPos, setCursor, addShapeToSelection, addShapes, onShapeCreated, setShapeBeingDragged, setShapeBeingDrawn } = this.props
		const touch = e.nativeEvent.touches[0]
		const docPt = new Point(
			touch.locationX * sheet.width / containerSize.width,
			touch.locationY * sheet.height / containerSize.height,
		)

		if (TOOLS.includes(selectedTool)) setCursor('pointer')

		if (TOOLS.includes(selectedTool) && this._shapeBeingDrawn) {
			setCursor('grabbing')

			this._shapeBeingDrawn.updateDraw(docPt)
		} else if (this.utils && this.shapes.find(shape => shape.isHovered(docPt, this.mapPos.scale, true))) {
			setCursor('pointer')
		}
	}

	onTouchEnd = (e, hoveredShapes, extras) => {
		const { allShapes, selectedTool } = this.props
		const { setCursor, deleteAnnotations, addShapes, onShapeCreated, setShapeBeingDragged, setShapeBeingDrawn } = this.props
		const { docPt } = extras;

		if (TOOLS.includes(selectedTool) && this._shapeBeingDrawn) {
			var shouldPersistShape = this._shapeBeingDrawn.stopDraw();

			if (shouldPersistShape) {
				// If shape being drawn is calibration, remove all others
				if (this._shapeBeingDrawn.constructorName === "CalibrationShape") {
					const calibrationShapes = (allShapes || []).filter(shape => shape.constructorName === "CalibrationShape")
					deleteAnnotations(calibrationShapes)
				}
	
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

export default DimensionsCanvas
