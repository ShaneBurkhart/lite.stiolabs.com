import _ from "underscore";
import Coords from "../geometry/coords";
import Point from "../geometry/point";
import { getPolylineDrawingSizes } from "../config/sizes";
import { hexNumsByName as HEXES } from "../config/colors";

const TOOLS = ["select", "multiSelect", "addSegment"]

const HOVERED_HEX = HEXES.blue_1;
const FOCUSED_HEX = HEXES.blue_2;

class PolylineSelectionsCanvas {
	constructor() {
		this.pixiApp = null

		this._focusedShape = null;
		this._focusedCornerIdx = null;
		this._focusedSegmentIdx = null;

		this._mouseDownPos = null
		this._shapeOnMouseDown = null

		this._shapeBeingDragged = null
		this._cornerBeingDragged = null

		this._shapeBeingHovered = null
		this._cornerBeingHovered = null
		this._segmentBeingHovered = null

		this._drawTmpIsDirty = false

		this.scale = 1
	}

	onMouseDown = (e, hoveredShapes, extras) => {
		const { visibleShapes, containerSize, mapPos, selectedShapes, selectedTool, isNative, clearShapeSelection, setCursor } = this.props;
		const { isSelectionTool } = getSelectionTool(selectedTool);
		
		if (!isSelectionTool) return;

		const { hasFocusedShape } = getFocusedShape(this._focusedShape, this._focusedCornerIdx, this._focusedSegmentIdx);
		const { shapeFocusedMode, shapeSelectedMode } = getSelectionMode({hasFocusedShape, selectedShapes});
		
		const { docPt } = extras;
		this._mouseDownPos = { x: e.clientX, y: e.clientY };

		const { selectedShapesHovered } = getHoveredShapes({ selectedShapes, docPt, mapPos, isNative });
		const { shapeHovered, shapeWithPtHovered, hoveredPtIdx  } = selectedShapesHovered || {};

		if (shapeFocusedMode || shapeSelectedMode) this._shapeOnMouseDown = shapeHovered || shapeWithPtHovered || null;

		if (shapeFocusedMode) {
			if (shouldCreateShapeBeingDragged(this._focusedShape, shapeWithPtHovered, this._focusedCornerIdx, hoveredPtIdx)) {
				this._setShapeBeingDragged(this._focusedShape, this._focusedCornerIdx);
				setCursor("grabbing");
			}
		}

		const canSelectUnselectedShapes = !shapeFocusedMode && !selectedShapesHovered;

		if (canSelectUnselectedShapes) {
			const { visibleShapesHovered } = getHoveredShapes({ visibleShapes, docPt, mapPos, isNative });
			const { shapeHovered, shapeWithPtHovered } = visibleShapesHovered || {};
			this._shapeOnMouseDown = shapeHovered || shapeWithPtHovered || null;
		}
	}

	onMouseMove = (e, hoveredShapes, extras) => {
		const { visibleShapes, selectedShapes, containerSize, selectedTool, mapPos, setCursor, onShapeUpdating, isNative, addShapeToSelection } = this.props
		const { isSelectionTool, isAddSegment } = getSelectionTool(selectedTool);

		if (!isSelectionTool) return;

		const { hasFocusedShape, shapeWithPtFocused, focusedCornerIdx } = getFocusedShape(this._focusedShape, this._focusedCornerIdx, this._focusedSegmentIdx);
		const { shapeFocusedMode, shapeSelectedMode, shapesUnselectedMode } = getSelectionMode({hasFocusedShape, selectedShapes});

		const { docPt } = extras;

		const { selectedShapesHovered } = getHoveredShapes({ selectedShapes, docPt, mapPos, isNative })

		if (shapeFocusedMode) {
			const { shapeBeingDragged, cornerBeingDragged } = getShapeBeingDragged(this._shapeBeingDragged, this._cornerBeingDragged);
			
			if (!!shapeBeingDragged) {
				e.stopPropagation()
				setCursor('grabbing');

				shapeBeingDragged.movePt(docPt, cornerBeingDragged)

				onShapeUpdating()
			} 

			if (!shapeBeingDragged) {
				const { shapeHovered, shapeWithPtHovered, hoveredPtIdx, hoveredSegmentIdx } = selectedShapesHovered || {};
				const showCanDrag = shouldCreateShapeBeingDragged(shapeWithPtFocused, shapeWithPtHovered, focusedCornerIdx, hoveredPtIdx);

				if (!selectedShapesHovered) setCursor('auto');
				if (!!selectedShapesHovered) setCursor('pointer');

				if (showCanDrag) {
					setCursor('grab');
					this._setShapeCornerBeingHovered(shapeWithPtFocused, focusedCornerIdx);
				};

				if (!showCanDrag && this._shapeBeingHoveredWillChange(shapeWithPtHovered || shapeHovered, hoveredPtIdx, hoveredSegmentIdx)) {
					this._setShapeBeingHovered(shapeHovered || shapeWithPtHovered, hoveredPtIdx, hoveredSegmentIdx);
				}
			}
		}

		if (shapeSelectedMode) {
			// console.log('shapeSelectedMode')
			if (!!selectedShapesHovered) {
				setCursor('pointer')

				const { shapeHovered, shapeWithPtHovered, hoveredPtIdx, hoveredSegmentIdx } = selectedShapesHovered;
				if (this._shapeBeingHoveredWillChange(shapeWithPtHovered || shapeHovered, hoveredPtIdx, hoveredSegmentIdx)) {
					this._setShapeBeingHovered(shapeWithPtHovered || shapeHovered, hoveredPtIdx, hoveredSegmentIdx);
				}
			}

			if (!selectedShapesHovered) {
				setCursor('auto')
				if (this._shapeBeingHovered) {
					this._clearShapeBeingHovered()
				};
				if (this._drawEnclosureOverlay) {
					this._drawEnclosureOverlay = false;
				}
			}
		}

		if (shapesUnselectedMode) {
			// console.log('shapesUnselectedMode')
			const { visibleShapesHovered } = getHoveredShapes({ visibleShapes, docPt, mapPos, isNative });
			const shapeHovered = visibleShapesHovered?.shapeHovered || null;
			const shapeWithPtHovered = visibleShapesHovered?.shapeWithPtHovered || null;
			if (visibleShapesHovered) setCursor('pointer');
			if (!visibleShapesHovered) setCursor('auto');

			if (this._shapeBeingHoveredWillChange(shapeWithPtHovered || shapeHovered)) {
				this._setShapeBeingHovered(shapeWithPtHovered || shapeHovered);
			}
		}
	}

	onMouseUp = (e, hoveredShapes, extras) => {
		const { visibleShapes, containerSize, selectedTool, selectedShapes, isNative } = this.props
		const { mapPos, onShapesUpdated, setSelectedShapes, addShapeToSelection, clearShapeSelection, setCursor, setSelectedTool } = this.props
		const { isSelectionTool, isAddSegment } = getSelectionTool(selectedTool);

		if (!this._mouseDownPos || !isSelectionTool) return;

		const { hasFocusedShape, shapeWithSegmentFocused, shapeWithPtFocused, focusedCornerIdx, focusedSegmentIdx } = getFocusedShape(this._focusedShape, this._focusedCornerIdx, this._focusedSegmentIdx);
		const { shapeFocusedMode, shapeSelectedMode, shapesUnselectedMode } = getSelectionMode({ hasFocusedShape, selectedShapes });

		const { docPt } = extras;

		const dx = e.clientX - this._mouseDownPos.x;
		const dy = e.clientY - this._mouseDownPos.y;
		const dist2 = Math.abs(dx * dx) + Math.abs(dy * dy);
		const tolerance2 = 20 * 20;
		const isClick = dist2 < tolerance2;

		const { selectedShapesHovered } = getHoveredShapes({ selectedShapes, docPt, mapPos, isNative })

		if (shapeFocusedMode) {
			const { shapeBeingDragged, cornerBeingDragged } = getShapeBeingDragged(this._shapeBeingDragged, this._cornerBeingDragged);
			
			const shouldChangeFocus = isClick && !isAddSegment && !shapeBeingDragged;
			
			if (isAddSegment) {
				// ADD NEW LINE SEGMENT TO POLYLINE
				// const shape = this._focusedShape;
				// const node = this._focusedCornerIdx;
				// if (!!shape && (node === 0 || node === shape.poly.ptArray.length - 1)) {
				// 	if (this._drawEnclosureOverlay) {
				// 		const otherEndNode = shape.poly.ptArray[node === 0 ? shape.poly.ptArray.length - 1 : 0];
				// 		shape.isClosed = true;
				// 		shape.updateDraw({ pt: otherEndNode, dragHandleIndex: node, selectedAttribute })
				// 		onShapesUpdated([ this._focusedShape ]);
				// 		setSelectedTool('select');
				// 		this._focusedShape = null;
				// 		this._focusedCornerIdx = null;
				// 	} else {
				// 		shape.updateDraw({ pt: docPt, dragHandleIndex: node, selectedAttribute });
				// 		onShapesUpdated([ this._focusedShape ]);
				// 		if (node !== 0) this._focusedCornerIdx = node + 1;
				// 	}
				// };
			}

			if (shapeBeingDragged && !isAddSegment) {
				if (!isClick) onShapesUpdated([shapeBeingDragged]);
				
				this._setShapeCornerBeingHovered(shapeBeingDragged, cornerBeingDragged);

				this._clearShapeBeingDragged();
			}
			
			if (shouldChangeFocus) {
				const ptIsFocused = !!shapeWithPtFocused;
				const segmentIsFocused = !!shapeWithSegmentFocused;

				if (!!selectedShapesHovered) {
					const { shapeHovered, shapeWithPtHovered, hoveredPtIdx, hoveredSegmentIdx } = selectedShapesHovered;
					const ptIsHovered = !!shapeWithPtHovered;
					const segmentIsHovered = !shapeWithPtHovered && !!shapeHovered && hoveredSegmentIdx !== null;
					const showCanDrag = ptIsFocused && ptIsHovered;

					if (showCanDrag) setCursor('grab')

					if (ptIsHovered) this._setShapeCornerBeingHovered(shapeWithPtHovered, hoveredPtIdx);
					if (segmentIsHovered) this._setShapeSegmentBeingHovered(shapeHovered, hoveredSegmentIdx);
					
					this._clearFocusedShape();
					
					if (ptIsFocused) {
						const isHoveringUnfocusedPt = ptIsHovered && hoveredPtIdx !== focusedCornerIdx  && shapeWithPtFocused.id === shapeWithPtHovered.id;
						if (isHoveringUnfocusedPt) this._setFocusedShapeCorner(shapeWithPtHovered, hoveredPtIdx);
						if (segmentIsHovered) this._setFocusedShapeSegment(shapeHovered, hoveredSegmentIdx)
					}

					if (segmentIsFocused) {
						const isHoveringUnfocusedSegment = !!shapeHovered && hoveredSegmentIdx !== focusedSegmentIdx && shapeWithSegmentFocused.id === shapeHovered.id;
						if (isHoveringUnfocusedSegment) this._setFocusedShapeSegment(shapeHovered, hoveredSegmentIdx);
						if (ptIsHovered) this._setFocusedShapeCorner(shapeWithPtHovered, hoveredPtIdx);
					}
				} else {
					this._clearFocusedShape();
				}
			}
		}

		if (shapeSelectedMode) {
			if (selectedShapesHovered) {
				const { shapeHovered, shapeWithPtHovered, hoveredPtIdx, hoveredSegmentIdx } = selectedShapesHovered;
				const ptIsHovered = !!shapeWithPtHovered;
				const segmentIsHovered = !shapeWithPtHovered && !!shapeHovered && isValidIdx(hoveredSegmentIdx, shapeHovered.attrArray);

				if (ptIsHovered) this._setFocusedShapeCorner(shapeWithPtHovered, hoveredPtIdx);
				if (segmentIsHovered) this._setFocusedShapeSegment(shapeHovered, hoveredSegmentIdx);
			}

			if (!selectedShapesHovered) {
				const { visibleShapesHovered } = getHoveredShapes({ visibleShapes, docPt, mapPos, isNative });
				if (!visibleShapesHovered && isClick) clearShapeSelection();
				if (!!visibleShapesHovered) {
					const unselectedShape = visibleShapesHovered.shapeHovered || visibleShapesHovered.shapeWithPtHovered;
					if (this._shapeOnMouseDown === unselectedShape) setSelectedShapes([this._shapeOnMouseDown]);
				}
			}
		}

		if (shapesUnselectedMode) {
			const { visibleShapesHovered } = getHoveredShapes({ visibleShapes, docPt, mapPos, isNative });
			if (!!visibleShapesHovered) {
				const unselectedShape = visibleShapesHovered.shapeHovered || visibleShapesHovered.shapeWithPtHovered;
				if (this._shapeOnMouseDown === unselectedShape) setSelectedShapes([this._shapeOnMouseDown]);
			}
		}

		this._mouseDownPos = null;
		this._shapeOnMouseDown = null;
	}

	onMouseLeave = (e, hoveredShapes, extras) => {
		const { onShapesUpdated } = this.props
		if (this._shapeBeingDragged) {
			onShapesUpdated([this._shapeBeingDragged]);
			this._shapeBeingDragged = null;
			this._cornerBeingDragged = null;
		}

	}

	onTouchStart = (e, hoveredShapes, extras) => {
		const { visibleShapes, containerSize, mapPos, selectedShapes, selectedTool, isNative, clearShapeSelection, setCursor } = this.props;
		const { isSelectionTool } = getSelectionTool(selectedTool);
		
		if (!isSelectionTool) return;

		const { hasFocusedShape } = getFocusedShape(this._focusedShape, this._focusedCornerIdx, this._focusedSegmentIdx);
		const { shapeFocusedMode, shapeSelectedMode } = getSelectionMode({hasFocusedShape, selectedShapes});
		
		const touch = e.nativeEvent.touches[0]
		const { docPt } = extras;
		this._mouseDownPos = { x: (touch.clientX || touch.pageX), y: (touch.clientY || touch.pageY) };

		const { selectedShapesHovered } = getHoveredShapes({ selectedShapes, docPt, mapPos, isNative });
		const { shapeHovered, shapeWithPtHovered, hoveredPtIdx  } = selectedShapesHovered || {};

		if (shapeFocusedMode || shapeSelectedMode) this._shapeOnMouseDown = shapeHovered || shapeWithPtHovered || null;

		if (shapeFocusedMode) {
			if (shouldCreateShapeBeingDragged(this._focusedShape, shapeWithPtHovered, this._focusedCornerIdx, hoveredPtIdx)) {
				this._setShapeBeingDragged(this._focusedShape, this._focusedCornerIdx);
				setCursor("grabbing");
			}
		}

		const canSelectUnselectedShapes = !shapeFocusedMode && !selectedShapesHovered;

		if (canSelectUnselectedShapes) {
			const { visibleShapesHovered } = getHoveredShapes({ visibleShapes, docPt, mapPos, isNative });
			const { shapeHovered, shapeWithPtHovered } = visibleShapesHovered || {};
			this._shapeOnMouseDown = shapeHovered || shapeWithPtHovered || null;
		}
	}

	onTouchMove = (e, hoveredShapes, extras) => {
		const { visibleShapes, selectedShapes, containerSize, selectedTool, mapPos, setCursor, onShapeUpdating, isNative, addShapeToSelection } = this.props
		const { isSelectionTool, isAddSegment } = getSelectionTool(selectedTool);

		if (!isSelectionTool) return;

		const { hasFocusedShape, shapeWithPtFocused, focusedCornerIdx } = getFocusedShape(this._focusedShape, this._focusedCornerIdx, this._focusedSegmentIdx);
		const { shapeFocusedMode, shapeSelectedMode, shapesUnselectedMode } = getSelectionMode({hasFocusedShape, selectedShapes});

		const touch = e.nativeEvent.touches[0]
		const { docPt } = extras;

		const { selectedShapesHovered } = getHoveredShapes({ selectedShapes, docPt, mapPos, isNative })

		if (shapeFocusedMode) {
			const { shapeBeingDragged, cornerBeingDragged } = getShapeBeingDragged(this._shapeBeingDragged, this._cornerBeingDragged);
			
			if (!!shapeBeingDragged) {
				e.stopPropagation()
				setCursor('grabbing');

				shapeBeingDragged.movePt(docPt, cornerBeingDragged)

				onShapeUpdating()
			} 

			if (!shapeBeingDragged) {
				const { shapeHovered, shapeWithPtHovered, hoveredPtIdx, hoveredSegmentIdx } = selectedShapesHovered || {};
				const showCanDrag = shouldCreateShapeBeingDragged(shapeWithPtFocused, shapeWithPtHovered, focusedCornerIdx, hoveredPtIdx);

				if (!selectedShapesHovered) setCursor('auto');
				if (!!selectedShapesHovered) setCursor('pointer');

				if (showCanDrag) {
					setCursor('grab');
					this._setShapeCornerBeingHovered(shapeWithPtFocused, focusedCornerIdx);
				};

				if (!showCanDrag && this._shapeBeingHoveredWillChange(shapeWithPtHovered || shapeHovered, hoveredPtIdx, hoveredSegmentIdx)) {
					this._setShapeBeingHovered(shapeHovered || shapeWithPtHovered, hoveredPtIdx, hoveredSegmentIdx);
				}
			}
		}

		if (shapeSelectedMode) {
			// console.log('shapeSelectedMode')
			if (!!selectedShapesHovered) {
				setCursor('pointer')

				const { shapeHovered, shapeWithPtHovered, hoveredPtIdx, hoveredSegmentIdx } = selectedShapesHovered;
				if (this._shapeBeingHoveredWillChange(shapeWithPtHovered || shapeHovered, hoveredPtIdx, hoveredSegmentIdx)) {
					this._setShapeBeingHovered(shapeWithPtHovered || shapeHovered, hoveredPtIdx, hoveredSegmentIdx);
				}
			}

			if (!selectedShapesHovered) {
				setCursor('auto')
				if (this._shapeBeingHovered) {
					this._clearShapeBeingHovered()
				};
				if (this._drawEnclosureOverlay) {
					this._drawEnclosureOverlay = false;
				}
			}
		}

		if (shapesUnselectedMode) {
			// console.log('shapesUnselectedMode')
			const { visibleShapesHovered } = getHoveredShapes({ visibleShapes, docPt, mapPos, isNative });
			const shapeHovered = visibleShapesHovered?.shapeHovered || null;
			const shapeWithPtHovered = visibleShapesHovered?.shapeWithPtHovered || null;
			if (visibleShapesHovered) setCursor('pointer');
			if (!visibleShapesHovered) setCursor('auto');

			if (this._shapeBeingHoveredWillChange(shapeWithPtHovered || shapeHovered)) {
				this._setShapeBeingHovered(shapeWithPtHovered || shapeHovered);
			}
		}
	}

	onTouchEnd = (e, hoveredShapes, extras) => {
		const { visibleShapes, containerSize, selectedTool, selectedShapes, isNative } = this.props
		const { mapPos, onShapesUpdated, setSelectedShapes, addShapeToSelection, clearShapeSelection, setCursor, setSelectedTool } = this.props
		const { isSelectionTool, isAddSegment } = getSelectionTool(selectedTool);

		console.log('onTouchEnd', 'mouseDown', this._mouseDownPos, isSelectionTool)
		if (!this._mouseDownPos || !isSelectionTool) return;

		const { hasFocusedShape, shapeWithSegmentFocused, shapeWithPtFocused, focusedCornerIdx, focusedSegmentIdx } = getFocusedShape(this._focusedShape, this._focusedCornerIdx, this._focusedSegmentIdx);
		const { shapeFocusedMode, shapeSelectedMode, shapesUnselectedMode } = getSelectionMode({ hasFocusedShape, selectedShapes });

		const { docPt } = extras;


		const touch = e.nativeEvent;
		const dx = (touch.clientX || touch.pageX) - this._mouseDownPos.x;
		const dy = (touch.clientY || touch.pageY) - this._mouseDownPos.y;
		const dist2 = Math.abs(dx * dx) + Math.abs(dy * dy);
		const tolerance2 = 100 * 100;
		const isClick = dist2 < tolerance2;

		const { selectedShapesHovered } = getHoveredShapes({ selectedShapes, docPt, mapPos, isNative })

		if (shapeFocusedMode) {
			const { shapeBeingDragged, cornerBeingDragged } = getShapeBeingDragged(this._shapeBeingDragged, this._cornerBeingDragged);
			
			const shouldChangeFocus = isClick && !isAddSegment && !shapeBeingDragged;
			
			if (shapeBeingDragged && !isAddSegment) {
				if (!isClick) onShapesUpdated([shapeBeingDragged]);
				
				this._setShapeCornerBeingHovered(shapeBeingDragged, cornerBeingDragged);

				this._clearShapeBeingDragged();
				setCursor('grab');
			}

			if (shouldChangeFocus) {
				// CHANGE TO THE NEW FOCUSED SHAPE OR CLEAR FOCUS
				const ptIsFocused = !!shapeWithPtFocused;
				const segmentIsFocused = !!shapeWithSegmentFocused;

				if (!!selectedShapesHovered) {
					const { shapeHovered, shapeWithPtHovered, hoveredPtIdx, hoveredSegmentIdx } = selectedShapesHovered;
					const ptIsHovered = !!shapeWithPtHovered;
					const segmentIsHovered = !shapeWithPtHovered && !!shapeHovered && hoveredSegmentIdx !== null;
					const showCanDrag = ptIsFocused && ptIsHovered;

					if (showCanDrag) setCursor('grab')

					if (ptIsHovered) this._setShapeCornerBeingHovered(shapeWithPtHovered, hoveredPtIdx);
					if (segmentIsHovered) this._setShapeSegmentBeingHovered(shapeHovered, hoveredSegmentIdx);
					
					this._clearFocusedShape();
					
					if (ptIsFocused) {
						const isHoveringUnfocusedPt = ptIsHovered && hoveredPtIdx !== focusedCornerIdx  && shapeWithPtFocused.id === shapeWithPtHovered.id;
						if (isHoveringUnfocusedPt) this._setFocusedShapeCorner(shapeWithPtHovered, hoveredPtIdx);
						if (segmentIsHovered) this._setFocusedShapeSegment(shapeHovered, hoveredSegmentIdx)
					}

					if (segmentIsFocused) {
						const isHoveringUnfocusedSegment = !!shapeHovered && hoveredSegmentIdx !== focusedSegmentIdx && shapeWithSegmentFocused.id === shapeHovered.id;
						if (isHoveringUnfocusedSegment) this._setFocusedShapeSegment(shapeHovered, hoveredSegmentIdx);
						if (ptIsHovered) this._setFocusedShapeCorner(shapeWithPtHovered, hoveredPtIdx);
					}
				} else {
					this._clearFocusedShape();
				}
			}
		}

		if (shapeSelectedMode) {
			if (selectedShapesHovered) {
				const { shapeHovered, shapeWithPtHovered, hoveredPtIdx, hoveredSegmentIdx } = selectedShapesHovered;
				const ptIsHovered = !!shapeWithPtHovered;
				const segmentIsHovered = !shapeWithPtHovered && !!shapeHovered && isValidIdx(hoveredSegmentIdx, shapeHovered.attrArray);

				if (ptIsHovered) this._setFocusedShapeCorner(shapeWithPtHovered, hoveredPtIdx);
				if (segmentIsHovered) this._setFocusedShapeSegment(shapeHovered, hoveredSegmentIdx);
			}

			if (!selectedShapesHovered) {
				const { visibleShapesHovered } = getHoveredShapes({ visibleShapes, docPt, mapPos, isNative });
				if (!visibleShapesHovered && isClick) clearShapeSelection();
				if (!!visibleShapesHovered) {
					const unselectedShape = visibleShapesHovered.shapeHovered || visibleShapesHovered.shapeWithPtHovered;
					if (this._shapeOnMouseDown === unselectedShape) setSelectedShapes([this._shapeOnMouseDown]);
				}
			}
		}

		if (shapesUnselectedMode) {
			const { visibleShapesHovered } = getHoveredShapes({ visibleShapes, docPt, mapPos, isNative });
			if (!!visibleShapesHovered) {
				const unselectedShape = visibleShapesHovered.shapeHovered || visibleShapesHovered.shapeWithPtHovered;
				if (this._shapeOnMouseDown === unselectedShape) setSelectedShapes([this._shapeOnMouseDown]);
			}
		}

		this._mouseDownPos = null;
		this._shapeOnMouseDown = null;
	}

	onUndo = () => {
	}

	onRedo = () => {
	}

	setProps(props) {
		this.props = props
	}

	/*
	* SELECTIONS LAYER HELPER FUNCTIONS
	*/

	_setShapeBeingDragged(shape, cornerIdx) {
		this._shapeBeingDragged = shape;
		this._cornerBeingDragged = cornerIdx;
		if (this.props.setShapeBeingDragged) this.props.setShapeBeingDragged(shape);
	}

	_setShapeBeingHovered(shape, hoveredPtIdx=null, hoveredSegmentIdx=null) {
		this._shapeBeingHovered = shape;
		this._cornerBeingHovered = hoveredPtIdx;
		this._segmentBeingHovered = hoveredSegmentIdx;
	}

	_setShapeCornerBeingHovered(shape, hoveredPtIdx) { this._setShapeBeingHovered(shape, hoveredPtIdx, null) }
	_setShapeSegmentBeingHovered(shape, hoveredSegmentIdx) { this._setShapeBeingHovered(shape, null, hoveredSegmentIdx) }

	_setFocusedShape(shape, cornerIdx, segmentIdx) {
		this._focusedShape = shape;
		this._focusedCornerIdx = cornerIdx;
		this._focusedSegmentIdx = segmentIdx;
		if (this.props.setFocusedShape) this.props.setFocusedShape({ shape, cornerIdx, segmentIdx });
	}

	_setFocusedShapeCorner(shape, cornerIdx) { this._setFocusedShape(shape, cornerIdx, null) }
	_setFocusedShapeSegment(shape, segmentIdx) { this._setFocusedShape(shape, null, segmentIdx) }
	
	_clearShapeBeingDragged() {
		if (this._shapeBeingDragged && this.props.setShapeBeingDragged) this.props.setShapeBeingDragged(null);
		this._shapeBeingDragged = null;
		this._cornerBeingDragged = null;
	}

	_clearFocusedShape() {
		if (this._focusedShape) {
			if (this.props.setFocusedShape) this.props.setFocusedShape(null);
			this._focusedShape = null;
			this._focusedCornerIdx = null;
			this._focusedSegmentIdx = null;
		}
	}

	_clearShapeBeingHovered() { this._setShapeBeingHovered(null, null, null) }

	_shapeBeingHoveredWillChange(nextShape, nextHoveredCornerIdx=null, nextHoveredSegmentIdx=null) {
		if (!this._shapeBeingHovered && !nextShape) return false;
		if (!this._shapeBeingHovered && !!nextShape || !!this._shapeBeingHovered && !nextShape) return true;
		const isSameShape = this._shapeBeingHovered.id === nextShape.id;
		const isSameCorner = this._cornerBeingHovered === nextHoveredCornerIdx;
		const isSameSegment = this._segmentBeingHovered === nextHoveredSegmentIdx;
		if (isSameShape && isSameCorner && isSameSegment) return false;
		return true;
	}
}


/** 
 * 
 * DRAWING FUNCTIONS
 * 
*/

const drawShapes = (ctx, shapes, zoomScale=1, utils) => {
	if (!shapes || !shapes.length || !ctx) return
	shapes.forEach(shape => { 
		if (shape) { 
			shape.draw(ctx, 1/zoomScale, utils); 
		}
	})
}

const drawShapeBounds = (ctx, shape, zoomScale=1, utils) => {
	if (!shape ||  !ctx) return
	shape.drawBounds(ctx, 1/zoomScale, utils);
}

const drawOverlay = (ctx, sheet) => {
	if (!ctx || !sheet) return;

	ctx.beginFill(HEXES.white, .55)
		.drawRect(0, 0, parseInt(sheet.width, 10), parseInt(sheet.height, 10))
		.endFill();
}

const drawFocusedShapeCorner = (ctx, shape, focusedCornerIdx, strokeWidth) => {
	if (!shape ||  !ctx) return
	const pt = shape.poly.ptArray[focusedCornerIdx]
	if (!pt) return console.warn('drawFocusedShapeCorner: invalid focused corner index');
	ctx.lineStyle(strokeWidth, FOCUSED_HEX, 1)
	ctx.beginFill(FOCUSED_HEX, .1);
	
	ctx.drawCircle(pt.x, pt.y, strokeWidth * 3);
	ctx.endFill();
}

const drawFocusedShapeSegment = (ctx, shape, focusedSegmentIdx, strokeWidth) => {
	if (!shape ||  !ctx) return
	const segmentStart = shape.poly.ptArray[focusedSegmentIdx]
	const segmentEnd = shape.poly.ptArray[focusedSegmentIdx + 1]
	if (!segmentStart || !segmentEnd) return console.warn('drawFocusedShapeSegment: invalid focused segment index');
	
	let focusedHex = FOCUSED_HEX;
	if (shape.attrArray?.[focusedSegmentIdx]?.isComplete) focusedHex = HEXES.aqua;
	
	ctx.lineStyle(strokeWidth, focusedHex, 1)
	ctx.moveTo(segmentStart.x, segmentStart.y)
	ctx.lineTo(segmentEnd.x, segmentEnd.y)
}

const drawHoveredShapeCorner = (ctx, shape, hoveredCornerIdx, strokeWidth) => {
	if (!shape ||  !ctx) return
	const pt = shape.poly.ptArray[hoveredCornerIdx]
	if (!pt) return console.warn('drawFocusedShapeCorner: invalid focused corner index');
	
	ctx.lineStyle(strokeWidth, HOVERED_HEX, 1)
	ctx.beginFill(HOVERED_HEX, .1);
	
	ctx.drawCircle(pt.x, pt.y, strokeWidth * 3);
	ctx.endFill();
}

const drawHoveredShapeSegment = (ctx, shape, hoveredSegmentIdx, strokeWidth) => {
	if (!shape ||  !ctx) return
	const segmentStart = shape.poly.ptArray[hoveredSegmentIdx]
	const segmentEnd = shape.poly.ptArray[hoveredSegmentIdx + 1]
	if (!segmentStart || !segmentEnd) return console.warn('drawHoveredShapeSegment: invalid hovered segment index');
	// if (shape.attrArray?.[hoveredSegmentIdx]?.isComplete) hoveredHex = HEXES.aqua;
	
	ctx.lineStyle(strokeWidth, HOVERED_HEX, 1)
	ctx.moveTo(segmentStart.x, segmentStart.y)
	ctx.lineTo(segmentEnd.x, segmentEnd.y)
}

/*
* 
*  STATE GETTER-LIKE FUNCTIONS AND VALIDATORS
*
*/

const isValidIdx = (idx, arr) => !isNaN(idx) && idx !== -1;


const getSelectionTool = selectedTool => ({
	isSingleSelect: selectedTool === TOOLS[0],
	isMultiSelect: selectedTool === TOOLS[1],
	isAddSegment: selectedTool === TOOLS[2],
	isSelectionTool: TOOLS.includes(selectedTool)
});

const getSelectionMode = ({ hasFocusedShape, selectedShapes }) => {
	const shapeFocusedMode = selectedShapes.length === 1 && hasFocusedShape;
	const shapeSelectedMode = selectedShapes.length === 1 && !hasFocusedShape;
	const shapesUnselectedMode = !selectedShapes.length;
	return { shapeFocusedMode, shapeSelectedMode, shapesUnselectedMode }
}

const _getHoveredShapes = (shapeArr, { docPt, mapPos={}, isNative=false }) => {
	let hoveredPtIdx = null;
	let hoveredSegmentIdx = null;
	const mapPosScale = mapPos.scale || 1
	if (mapPosScale === 0) mapPosScale === 0.000001;

	const shapeHovered = shapeArr.find(shape => {
		let segmentIdx = shape.isHovered(docPt, 1/mapPosScale, isNative)

		if (!segmentIdx) return false;

		hoveredSegmentIdx = segmentIdx[0];
		return true;
	});

	const shapeWithPtHovered = shapeArr.find(shape => {
		hoveredPtIdx = shape.isDragHandleHovered(docPt, 1/mapPosScale, isNative)
		return -1 !== hoveredPtIdx;
	});

	if (hoveredPtIdx === -1) hoveredPtIdx = null;
	if (!shapeHovered && !shapeWithPtHovered) return null;

	return { shapeHovered, shapeWithPtHovered, hoveredPtIdx, hoveredSegmentIdx }
}

const getHoveredShapes = ({ selectedShapes, visibleShapes, ...options }) => {
	let selectedShapesHovered;
	let visibleShapesHovered;
	if (selectedShapes?.length) selectedShapesHovered = _getHoveredShapes(selectedShapes, options);
	if (visibleShapes?.length) visibleShapesHovered = _getHoveredShapes(visibleShapes, options);
	
	return { selectedShapesHovered, visibleShapesHovered }
}


const shouldCreateShapeBeingDragged = (focusedShape, hoveredShape, focusedCornerIdx, hoveredPtIdx) => {
	return !!focusedShape && !!hoveredShape
		&& focusedShape.id === hoveredShape.id
		&& isValidIdx(focusedCornerIdx, focusedShape.poly.ptArray) && isValidIdx(hoveredPtIdx, hoveredShape.poly.ptArray)
		&& focusedCornerIdx === hoveredPtIdx;
}

const getTouchDocPt = (touch, sheet, containerSize) => new Point(
	touch.locationX * sheet.width / containerSize.width,
	touch.locationY * sheet.height / containerSize.height,
)

const getMouseDocPt = (e, mapPos, containerSize) => Coords.screenPtToDoc(
	e.clientX - containerSize.x, 
	e.clientY - containerSize.y, 
	mapPos,
	containerSize
);

const getFocusedShape = (focusedShape, focusedCornerIdx, focusedSegmentIdx) => {
	const res = {
		shapeWithSegmentFocused: null,
		shapeWithPtFocused: null,
		focusedCornerIdx: null,
		focusedSegmentIdx: null,
		hasFocusedShape: false,
	}

	if (!focusedShape || !focusedShape.poly) return { ...res };

	if (focusedCornerIdx !== null) {
		res.shapeWithPtFocused = focusedShape;
		res.focusedCornerIdx = focusedCornerIdx;
	} else if (focusedSegmentIdx !== null) {
		res.shapeWithSegmentFocused = focusedShape;
		res.focusedSegmentIdx = focusedSegmentIdx;
	}

	res.hasFocusedShape = !!res.shapeWithPtFocused || !!res.shapeWithSegmentFocused;

	return { ...res }
}

const getShapeBeingHovered = (shapeBeingHovered=null, cornerBeingHovered=null, segmentBeingHovered=null) => {
	const res = {
		shapeBeingHovered,
		shapeWithSegmentHovered: null,
		shapeWithPtHovered: null,
		hoveredSegmentIdx: null,
		hoveredCornerIdx: null,
		hasHoveredShapeEl: false,
	}

	if (!shapeBeingHovered || !shapeBeingHovered.poly || (cornerBeingHovered === null && segmentBeingHovered === null)) return { ...res };

	if (cornerBeingHovered !== null) {
		res.shapeWithPtHovered = shapeBeingHovered;
		res.hoveredCornerIdx = cornerBeingHovered;
	} else if (segmentBeingHovered !== null) {
		res.shapeWithSegmentHovered = shapeBeingHovered;
		res.hoveredSegmentIdx = segmentBeingHovered;
	}

	res.hasHoveredShapeEl = !!res.shapeWithPtHovered || !!res.shapeWithSegmentHovered;

	return { ...res }
}

const getShapeBeingDragged = (shapeBeingDragged, cornerBeingDragged) => {
	if (!shapeBeingDragged || isNaN(cornerBeingDragged) || cornerBeingDragged === -1 ) return { shapeBeingDragged: null, cornerBeingDragged: null };
	if (!shapeBeingDragged.poly.ptArray[cornerBeingDragged]) return { shapeBeingDragged: null, cornerBeingDragged: null };
	return { shapeBeingDragged, cornerBeingDragged }
}

export default PolylineSelectionsCanvas;
