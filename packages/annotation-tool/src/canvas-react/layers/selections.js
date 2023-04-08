import _ from "underscore";
import LassoShape from "../shapes/lasso"

// import { SHOW_TOUCH_AREAS } from '../config/debug'

const TOOLS = ["select", "multiSelect"]

const getSelectionTool = selectedTool => ({
	isSingleSelect: selectedTool === TOOLS[0],
	isMultiSelect: selectedTool === TOOLS[1],
	isSelectionTool: TOOLS.includes(selectedTool)
});

class SelectionsCanvas {
	constructor() {
		this.pixiApp = null

		this._mouseDownPos = null
		this._shapeOnMouseDown = null
		this._shapeBeingDragged = null
		this._cornerBeingDragged = -1
		this._moveAllLastPoint = null
	}

	onMouseDown = (e, hoveredShapes, extras) => {
		const { mapPos, selectedShapes, selectedTool, setShapeBeingDragged, clearShapeSelection, setCursor } = this.props;
		const { isSingleSelect, isMultiSelect, isSelectionTool } = getSelectionTool(selectedTool);
		const { selectedShapesHovered, visibleShapesHovered } = hoveredShapes;
		const { docPt } = extras;
		
		if (!isSelectionTool) return;
		
		this._mouseDownPos = { x: e.clientX, y: e.clientY };

		if (isMultiSelect) {
			if (selectedShapesHovered) {
				// moving a selected shape and therefore a group
				setShapeBeingDragged(selectedShapesHovered[0] || selectedShapesHovered[1])
				this._moveAllLastPoint = { x: docPt.x, y: docPt.y }
			} else {
				// init the tmp shape we use to multi select 
				this._shapeBeingDrawn = new LassoShape();
				this._shapeBeingDrawn.startDraw(docPt)
				setShapeBeingDragged(this._shapeBeingDragged)
				
				setCursor('pointer')
			}
		} else if (isSingleSelect) {
			if (!selectedShapesHovered && !visibleShapesHovered) {
				// didn't click on anything
				clearShapeSelection()	
			} else if (selectedShapesHovered) {
				// moving a shape that is selected
				const [shapeHovered, shapeWithCornerHovered] = selectedShapesHovered;
				const shapeBeingDragged = shapeWithCornerHovered || shapeHovered;

				setShapeBeingDragged(shapeBeingDragged)
				this._shapeBeingDragged = shapeBeingDragged

				if (shapeWithCornerHovered) {
					// set up drag corner
					this._cornerBeingDragged = this._shapeBeingDragged.isDragHandleHovered(docPt, mapPos.scale, false)
					setCursor('grab'); 
				} else {
					// set up drag shape
					this._moveAllLastPoint = { x: docPt.x, y: docPt.y }
				}
			}
		}
	}

	onMouseMove = (e, hoveredShapes, extras) => {
		const { selectedShapes, selectedTool, mapPos, setCursor, onShapeUpdating, addShapeToSelection } = this.props
		const { isSingleSelect, isMultiSelect, isSelectionTool } = getSelectionTool(selectedTool);
		const { selectedShapesHovered, visibleShapesHovered } = hoveredShapes;
		const { docPt } = extras;

		if (!isSelectionTool) return;

		if (isMultiSelect) {
			// we can only drag a group if we have a group selected
			// if we are on a visible shape, we can select it
			if (this._shapeBeingDrawn) {
				// selecting with the lasso tool
				setCursor('pointer')
				this._shapeBeingDrawn.updateDraw(docPt)

				if (visibleShapesHovered) addShapeToSelection(visibleShapesHovered[0] || visibleShapesHovered[1]);
			} else if (selectedShapes.length && this._moveAllLastPoint) {
				const dx = docPt.x - this._moveAllLastPoint.x;
				const dy = docPt.y - this._moveAllLastPoint.y;

				selectedShapes.forEach(shape => shape.move(dx, dy));
				onShapeUpdating()
				setCursor('grabbing');

				this._moveAllLastPoint = { x: docPt.x, y: docPt.y };
			} else if (selectedShapesHovered) {
				// hovering a selected shape but not dragging the group or lasso
				setCursor('grab')
			} else if (visibleShapesHovered) {
				// hovering an unselected shape but not dragging the group or lasso
				setCursor('pointer')
			} else {
				// hovering nothing
				setCursor('auto')
			}
		} else if (isSingleSelect) {
			if (selectedShapes.length && this._shapeBeingDragged && this._cornerBeingDragged !== -1) {
				// dragging a corner of a shape
				this._shapeBeingDragged.updateDraw(docPt, this._cornerBeingDragged)
				onShapeUpdating()
				setCursor('grabbing');
			} else if (selectedShapes.length && this._moveAllLastPoint) {
				// move/dragging a shape
				const dx = docPt.x - this._moveAllLastPoint.x;
				const dy = docPt.y - this._moveAllLastPoint.y;

				selectedShapes.forEach(shape => shape.move(dx, dy));
				onShapeUpdating()
				setCursor('grabbing');

				this._moveAllLastPoint = { x: docPt.x, y: docPt.y };
			} else if (selectedShapesHovered) {
				// hovering a selected shape but not dragging the group or lasso
				setCursor('grab')
			} else if (visibleShapesHovered) {
				// hovering an unselected shape but not dragging the group or lasso
				setCursor('pointer')
			} else {
				// hovering nothing
				setCursor('auto')
			}
		}
	}

	onMouseUp = (e, hoveredShapes, extras) => {
		const { visibleShapes, containerSize, setCursor, selectedTool, selectedShapes } = this.props
		const { mapPos, onShapesUpdated, setShapeBeingDragged, addShapeToSelection, clearShapeSelection, setShapeBeingDrawn } = this.props
		const { isMultiSelect, isSingleSelect, isSelectionTool } = getSelectionTool(selectedTool);
		const { selectedShapesHovered, visibleShapesHovered } = hoveredShapes;
		const { docPt } = extras;

		if (!isSelectionTool) return;

		if (isMultiSelect) {
			if (this._shapeBeingDrawn) {
				// clean up the lasso
				// returns if the lasso was long enough or not (valid or not)
				const isLasso = this._shapeBeingDrawn.stopDraw();
				const isClick = !isLasso;
				
				if (isClick) {
					// we clicked the same area rather than drawing a lasso
					if (!visibleShapesHovered && !selectedShapesHovered) {
						// we clicked on nothing
						clearShapeSelection();
					} else if (visibleShapesHovered) {
						// we clicked on an unselected shape
						addShapeToSelection(visibleShapesHovered[0] || visibleShapesHovered[1]);
					} 
				}

				this._shapeBeingDrawn = null;
				setShapeBeingDrawn(this._shapeBeingDrawn)
			} else if (selectedShapes.length && this._moveAllLastPoint) {
				// move/dragging a group of shapes
				onShapesUpdated([...selectedShapes])
			} else if (visibleShapesHovered && !selectedShapesHovered && this._mouseDownPos) {
				// select a shape only if we aren't hovering a selected shape
				const dx = e.clientX - this._mouseDownPos.x;
				const dy = e.clientY - this._mouseDownPos.y;
				const dist2 = Math.abs(dx * dx) + Math.abs(dy * dy)
				const tolerance2 = 20 * 20
				const isSameTouch = dist2 < tolerance2

				let unselectedShape = visibleShapesHovered[0] || visibleShapesHovered[1];
				if (isSameTouch) addShapeToSelection(unselectedShape);
			}
		} else if (isSingleSelect) {
			if (selectedShapes.length && this._shapeBeingDragged && this._cornerBeingDragged !== -1) {
				// dragged a corner of a shape
				onShapesUpdated([this._shapeBeingDragged])
			} else if (selectedShapes.length && this._moveAllLastPoint) {
				// move/dragging a shape
				onShapesUpdated([...selectedShapes])
			} else if (visibleShapesHovered && !selectedShapesHovered && this._mouseDownPos) {
				// select a shape only if we aren't hovering a selected shape
				const dx = e.clientX - this._mouseDownPos.x;
				const dy = e.clientY - this._mouseDownPos.y;
				const dist2 = Math.abs(dx * dx) + Math.abs(dy * dy)
				const tolerance2 = 20 * 20
				const isSameTouch = dist2 < tolerance2

				let unselectedShape = visibleShapesHovered[0] || visibleShapesHovered[1];
				if (isSameTouch) addShapeToSelection(unselectedShape);
			}
		}

		this._mouseDownPos = null
		this._moveAllLastPoint = null;
		this._shapeBeingDragged = null;
		this._cornerBeingDragged = -1;
		setShapeBeingDragged(null)
		setCursor('auto')
	}

	onMouseLeave = (e, hoveredShapes, extras) => { this.onMouseUp(e, hoveredShapes, extras) }

	onTouchStart = (e, hoveredShapes, extras) => {
		const { selectedTool, selectedShapes, clearShapeSelection, mapPos, setCursor, setShapeBeingDragged, setShapeBeingDrawn } = this.props
		const { isSingleSelect, isMultiSelect, isSelectionTool } = getSelectionTool(selectedTool);
		const { selectedShapesHovered, visibleShapesHovered } = hoveredShapes;
		const { docPt } = extras;
		
		if (!isSelectionTool) return;
		
		const touch = e.nativeEvent.touches[0]
		this._mouseDownPos = { x: (touch.clientX || touch.pageX), y: (touch.clientY || touch.pageY) };

		if (isMultiSelect) {
			if (selectedShapesHovered) {
				// moving a selected shape and therefore a group
				setShapeBeingDragged(selectedShapesHovered[0] || selectedShapesHovered[1])
				this._moveAllLastPoint = { x: docPt.x, y: docPt.y }
			} else {
				// init the tmp shape we use to multi select 
				this._shapeBeingDrawn = new LassoShape();
				this._shapeBeingDrawn.startDraw(docPt)
				setShapeBeingDrawn(this._shapeBeingDrawn)
				
				setCursor('pointer')
			}
		} else if (isSingleSelect) {
			if (!selectedShapesHovered && !visibleShapesHovered) {
				// didn't click on anything
				clearShapeSelection()	
			} else if (selectedShapesHovered) {
				// moving a shape that is selected
				const [shapeHovered, shapeWithCornerHovered] = selectedShapesHovered;
				const shapeBeingDragged = shapeWithCornerHovered || shapeHovered;

				setShapeBeingDragged(shapeBeingDragged)
				this._shapeBeingDragged = shapeBeingDragged

				if (shapeWithCornerHovered) {
					// set up drag corner
					this._cornerBeingDragged = this._shapeBeingDragged.isDragHandleHovered(docPt, mapPos.scale, true)
					setCursor('grab'); 
				} else {
					// set up drag shape
					this._moveAllLastPoint = { x: docPt.x, y: docPt.y }
				}
			}
		}
	}

	onTouchMove = (e, hoveredShapes, extras) => {
		const { selectedShapes, selectedTool, mapPos, setCursor, onShapeUpdating, addShapeToSelection } = this.props
		const { isSingleSelect, isMultiSelect, isSelectionTool } = getSelectionTool(selectedTool);
		const { selectedShapesHovered, visibleShapesHovered } = hoveredShapes;
		const { docPt } = extras;

		if (!isSelectionTool) return;

		if (isMultiSelect) {
			// we can only drag a group if we have a group selected
			// if we are on a visible shape, we can select it
			if (this._shapeBeingDrawn) {
				// selecting with the lasso tool
				setCursor('pointer')
				this._shapeBeingDrawn.updateDraw(docPt)

				if (visibleShapesHovered) addShapeToSelection(visibleShapesHovered[0] || visibleShapesHovered[1]);
			} else if (selectedShapes.length && this._moveAllLastPoint) {
				const dx = docPt.x - this._moveAllLastPoint.x;
				const dy = docPt.y - this._moveAllLastPoint.y;

				selectedShapes.forEach(shape => shape.move(dx, dy));
				onShapeUpdating()
				setCursor('grabbing');

				this._moveAllLastPoint = { x: docPt.x, y: docPt.y };
			} else if (selectedShapesHovered) {
				// hovering a selected shape but not dragging the group or lasso
				setCursor('grab')
			} else if (visibleShapesHovered) {
				// hovering an unselected shape but not dragging the group or lasso
				setCursor('pointer')
			} else {
				// hovering nothing
				setCursor('auto')
			}
		} else if (isSingleSelect) {
			if (selectedShapes.length && this._shapeBeingDragged && this._cornerBeingDragged !== -1) {
				// dragging a corner of a shape
				this._shapeBeingDragged.updateDraw(docPt, this._cornerBeingDragged)
				onShapeUpdating()
				setCursor('grabbing');
			} else if (selectedShapes.length && this._moveAllLastPoint) {
				// move/dragging a shape
				const dx = docPt.x - this._moveAllLastPoint.x;
				const dy = docPt.y - this._moveAllLastPoint.y;

				selectedShapes.forEach(shape => shape.move(dx, dy));
				onShapeUpdating()
				setCursor('grabbing');

				this._moveAllLastPoint = { x: docPt.x, y: docPt.y };
			} else if (selectedShapesHovered) {
				// hovering a selected shape but not dragging the group or lasso
				setCursor('grab')
			} else if (visibleShapesHovered) {
				// hovering an unselected shape but not dragging the group or lasso
				setCursor('pointer')
			} else {
				// hovering nothing
				setCursor('auto')
			}
		}
	}

	onTouchEnd = (e, hoveredShapes, extras) => {
		const { visibleShapes, containerSize, setCursor, selectedTool, selectedShapes } = this.props
		const { mapPos, onShapesUpdated, setShapeBeingDragged, addShapeToSelection, clearShapeSelection, setShapeBeingDrawn } = this.props
		const { isMultiSelect, isSingleSelect, isSelectionTool } = getSelectionTool(selectedTool);
		const { selectedShapesHovered, visibleShapesHovered } = hoveredShapes;
		const { docPt } = extras;

		if (!isSelectionTool) return;

		const touch = e.nativeEvent.touches[0] || e.nativeEvent.changedTouches[0];

		if (isMultiSelect) {
			if (this._shapeBeingDrawn) {
				// clean up the lasso
				// returns if the lasso was long enough or not (valid or not)
				const isLasso = this._shapeBeingDrawn.stopDraw();
				const isClick = !isLasso;
				
				if (isClick) {
					// we clicked the same area rather than drawing a lasso
					if (!visibleShapesHovered && !selectedShapesHovered) {
						// we clicked on nothing
						clearShapeSelection();
					} else if (visibleShapesHovered) {
						// we clicked on an unselected shape
						addShapeToSelection(visibleShapesHovered[0] || visibleShapesHovered[1]);
					} 
				}

				this._shapeBeingDrawn = null;
				setShapeBeingDrawn(this._shapeBeingDrawn)
			} else if (selectedShapes.length && this._moveAllLastPoint) {
				// move/dragging a group of shapes
				onShapesUpdated([...selectedShapes])
			} else if (visibleShapesHovered && !selectedShapesHovered && this._mouseDownPos) {
				// select a shape only if we aren't hovering a selected shape
				const dx = (touch.clientX || touch.pageX) - this._mouseDownPos.x;
				const dy = (touch.clientY || touch.pageY) - this._mouseDownPos.y;
				const dist2 = Math.abs(dx * dx) + Math.abs(dy * dy)
				const tolerance2 = 20 * 20
				const isSameTouch = dist2 < tolerance2

				let unselectedShape = visibleShapesHovered[0] || visibleShapesHovered[1];
				if (isSameTouch) addShapeToSelection(unselectedShape);
			}
		} else if (isSingleSelect) {
			if (selectedShapes.length && this._shapeBeingDragged && this._cornerBeingDragged !== -1) {
				// dragged a corner of a shape
				onShapesUpdated([this._shapeBeingDragged])
			} else if (selectedShapes.length && this._moveAllLastPoint) {
				// move/dragging a shape
				onShapesUpdated([...selectedShapes])
			} else if (visibleShapesHovered && !selectedShapesHovered && this._mouseDownPos) {
				// select a shape only if we aren't hovering a selected shape
				const dx = (touch.clientX || touch.pageX) - this._mouseDownPos.x;
				const dy = (touch.clientY || touch.pageY) - this._mouseDownPos.y;
				const dist2 = Math.abs(dx * dx) + Math.abs(dy * dy)
				const tolerance2 = 20 * 20
				const isSameTouch = dist2 < tolerance2

				let unselectedShape = visibleShapesHovered[0] || visibleShapesHovered[1];
				if (isSameTouch) addShapeToSelection(unselectedShape);
			}
		}

		this._mouseDownPos = null
		this._moveAllLastPoint = null;
		this._shapeBeingDragged = null;
		this._cornerBeingDragged = -1;
		setShapeBeingDragged(null)
		setCursor('auto')
	}

	setProps(props) {
		this.props = props
	}
}

export default SelectionsCanvas;