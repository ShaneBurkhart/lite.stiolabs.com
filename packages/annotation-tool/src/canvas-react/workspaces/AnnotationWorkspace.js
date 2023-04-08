import _ from "underscore"
import Coords from "../geometry/coords"
import Point from "../geometry/point"

import DimensionsCanvas from "../layers/dimensions"
import SymbolsCanvas from "../layers/symbols"
import SelectionsCanvas from "../layers/selections"
import SheetCalloutsCanvas from "../layers/sheetCallouts"
import TextSearchCanvas from "../layers/textSearches"

const _getHoveredShapes = (shapeArr, { docPt, mapPos, isTouch=false }) => {
	const shapeHovered = shapeArr.find(shape => shape.isHovered(docPt, mapPos.scale, isTouch))
	const shapeWithCornerHovered = shapeArr.find(shape => -1 !== shape.isDragHandleHovered(docPt, mapPos.scale, isTouch));

	if (!shapeHovered && !shapeWithCornerHovered) return null;
	return [shapeHovered, shapeWithCornerHovered];
}

const getHoveredShapes = (e, props, isTouch=false) => { //TODO: convert to .filter as needed
	const { sheet, calloutLinks, selectedShapes, visibleShapes, mapPos, containerSize } = props;
	const options = { mapPos, isTouch }

	if (isTouch) {
		const touch = e.nativeEvent.touches[0] || e.nativeEvent.changedTouches[0]

		options.docPt = new Point(
			touch.locationX * sheet.width / containerSize.width,
			touch.locationY * sheet.height / containerSize.height,
		)
	} else {
		options.docPt = Coords.screenPtToDoc(
			e.clientX - containerSize.x, 
			e.clientY - containerSize.y, 
			mapPos,
			containerSize
		)
	}

	let selectedShapesHovered;
	if (selectedShapes?.length) selectedShapesHovered = _getHoveredShapes(selectedShapes, options);

	let visibleShapesHovered;
	if (visibleShapes?.length) visibleShapesHovered = _getHoveredShapes(visibleShapes, options);

	let calloutShapesHovered = [];
	if (calloutLinks?.length) calloutShapesHovered = _getHoveredShapes(calloutLinks, options) || [];
	
	return [ 
		{ 
			selectedShapesHovered, 
			visibleShapesHovered,
			calloutShapesHovered: [calloutShapesHovered[0], calloutShapesHovered[1]]
		}, 
		options	
	]
}

class AnnotationWorkspace {
	constructor() {
		this.layers = [
			new TextSearchCanvas(),
			new SheetCalloutsCanvas(),
			new DimensionsCanvas(),
			new SymbolsCanvas(),
			new SelectionsCanvas()
		]

		this.calloutLinks = []
		// only allow one touch
		this.touchId = null
	}

	// each handler should receive it's event and an object with the shapes that are hovered
	// Use find() so we short circuit if a responder returns true, consuming the event
	onMouseDown = (e) => { 
		this.layers.find(layer => layer.onMouseDown(e, ...getHoveredShapes(e, this.props, false))) 
	}
	onMouseMove = (e) => { 
		if (this.util) this.util.setCursor("move"); 
		this.layers.find(layer => layer.onMouseMove(e, ...getHoveredShapes(e, this.props, false))) 
	}
	onMouseUp = (e) => { 
		this.layers.find(layer => layer.onMouseUp(e, ...getHoveredShapes(e, this.props, false))) 
	}
	onMouseLeave = (e) => { 
		this.layers.find(layer => layer.onMouseLeave(e, ...getHoveredShapes(e, this.props, false))) 
	}
	onTouchStart = (e) => { 
		if (this.touchId && e.nativeEvent.identifier !== this.touchId) return;
		this.touchId = e.nativeEvent.identifier
		this.layers.find(layer => layer.onTouchStart(e, ...getHoveredShapes(e, this.props, true))) 
	}
	onTouchMove = (e) => { 
		if (this.touchId && e.nativeEvent.identifier !== this.touchId) return;
		this.layers.find(layer => layer.onTouchMove(e, ...getHoveredShapes(e, this.props, true))) 
	}
	onTouchEnd = (e) => { 
		if (this.touchId && e.nativeEvent.identifier !== this.touchId) return;
		this.layers.find(layer => layer.onTouchEnd(e, ...getHoveredShapes(e, this.props, true))) 
		this.touchId = null;
	}

	render(props) {
		const { setAllShapes, selectedShapes, setSelectedShapes, selectedTool, allShapes } = props
		this.props = props;
		this.props.calloutLinks = this.calloutLinks;

		const addShapeToSelection = (shape) => {
			if (!shape || selectedShapes.includes(shape)) return 

			let _selectedShapes = selectedShapes
			if (selectedTool === 'select' && selectedShapes.length) _selectedShapes = [];
			_selectedShapes.push(shape)

			setSelectedShapes([..._selectedShapes])
		}

		const clearShapeSelection = () => { setSelectedShapes([]) }

		this.layers.forEach(layer => layer.setProps({
			...props,
			setCalloutLinks: (links) => {
				this.calloutLinks = links;
				this.props.calloutLinks = links;
			},
			addShapes: (newShapes) => {
				setAllShapes([ ...allShapes, ...newShapes ])
			},
			addShapeToSelection,
			clearShapeSelection,
		}))
	}
}

export default AnnotationWorkspace
