import _ from "underscore";
import Coords from "../geometry/coords";
import Point from "../geometry/point";
import PolylineShape, { closePolyline, getColor } from "../shapes/polyline";
import TmpLineShape from "../shapes/polylineTmpLine";
import { getPhaseCode } from '../../workComplete/phaseCodes';
import { hexNumsByName as HEXES } from "../config/colors";


const getCurrentTool = selectedTool => ({
	isPolylineTool: selectedTool === "polyline",
});

const handleCreatePolyline = ({ selectedPhaseCode, selectedBuildingArea, selectedScale, customScaleDisplay }) => {
	const polyline = new PolylineShape();
	polyline.buildingArea = selectedBuildingArea;
	polyline.phaseCode = selectedPhaseCode;
	polyline.scale = selectedScale;
	polyline.customScaleDisplay = customScaleDisplay || null;
	polyline.color = getColor(selectedPhaseCode);
	return polyline;
}

class PolylinesCanvas {
	constructor() {
		this._shapeBeingDrawn = null
		this._tmpLine = null
		this._shouldDrawClosedShapeOverlay = false
		this.scale = 1

		this._shapesBeingDrawnByPhaseCode = null
		this._skippedPhaseCodes = []
		this._skippedPoint = null

		this._onTouchDownPoint = null
	}

	onMouseDown = (e, hoveredShapes, extras) => {
		const { containerSize, mapPos, selectedTool, selectedScale, customScaleDisplay, selectedBuildingArea, setShapesBeingDrawn } = this.props
		const { selectedPhaseCodes, selectedPhaseCodesWithAttributes, visiblePhaseCodes, visiblePhaseCodesWithValidAttributes } = this.props;
		const { isPolylineTool } = getCurrentTool(selectedTool);
		const { selectedShapesHovered, visibleShapesHovered } = hoveredShapes;
		const { docPt } = extras;

		// there is nothing to do if not the polyline tool
		if (!isPolylineTool) return;

		// use one line for tmp line, and just save persisted points
		if (!!this._tmpLine) this._tmpLine = null;

		// make sure we have an array
		if (!this._shapesBeingDrawnByPhaseCode) this._shapesBeingDrawnByPhaseCode = {};

		const validPhaseCodes = Object.keys(visiblePhaseCodesWithValidAttributes);
		validPhaseCodes.forEach(phaseCode => {
			const isEachPhaseCode = getPhaseCode(phaseCode)?.type === "EACH";

			if (!this._shapesBeingDrawnByPhaseCode[phaseCode]) this._shapesBeingDrawnByPhaseCode[phaseCode] = [];
			if (!this._shapesBeingDrawnByPhaseCode[phaseCode].length) {
				this._shapesBeingDrawnByPhaseCode[phaseCode].push(handleCreatePolyline({ selectedPhaseCode: phaseCode, selectedBuildingArea, selectedScale, customScaleDisplay }));
			} else if (this._skippedPhaseCodes.includes(phaseCode)) {
				// todo: add initial point of last point
				this._shapesBeingDrawnByPhaseCode[phaseCode].push(handleCreatePolyline({ selectedPhaseCode: phaseCode, selectedBuildingArea, selectedScale, customScaleDisplay }));
			} else if (isEachPhaseCode) {
				this._shapesBeingDrawnByPhaseCode[phaseCode].push(handleCreatePolyline({ selectedPhaseCode: phaseCode, selectedBuildingArea, selectedScale, customScaleDisplay }));
			}
		})

		const topmostShapes = Object.keys(this._shapesBeingDrawnByPhaseCode).map(phaseCode => {
			const shapeCount = this._shapesBeingDrawnByPhaseCode[phaseCode].length;
			return this._shapesBeingDrawnByPhaseCode[phaseCode][shapeCount - 1]
		}).filter(shape => !!shape);
		setShapesBeingDrawn(topmostShapes);
	}

	onMouseMove = (e, hoveredShapes, extras) => {
		const { containerSize, selectedTool, mapPos, setCursor, isNative } = this.props
		
		const { isPolylineTool } = getCurrentTool(selectedTool);

		if (!isPolylineTool) return;

		const { docPt } = extras;

		// update the point if it's being dragged
	}

	onMouseUp = (e, hoveredShapes, extras) => {
		const { containerSize, selectedTool, setSelectedTool, mapPos, allShapes, addShapes, onShapesCreated, onShapesUpdated } = this.props
		const { selectedPhaseCodes, selectedPhaseCodesWithAttributes, visiblePhaseCodes, visiblePhaseCodesWithValidAttributes } = this.props;

		const { isPolylineTool } = getCurrentTool(selectedTool);

		if (!isPolylineTool) return;

		const { docPt } = extras;

		if (!!this._shapesBeingDrawnByPhaseCode) {
			const validPhaseCodes = Object.keys(visiblePhaseCodesWithValidAttributes);

			this._skippedPhaseCodes = [];
			selectedPhaseCodes.forEach(phaseCode => {
				if (!validPhaseCodes.includes(phaseCode)) this._skippedPhaseCodes.push(phaseCode);
			})

			if (validPhaseCodes.length) {
				const toCreate = [];
				const toUpdate = [];

				validPhaseCodes.forEach(phaseCode => {
					const selectedAttributes = visiblePhaseCodesWithValidAttributes[phaseCode];
					const shapeCount = this._shapesBeingDrawnByPhaseCode[phaseCode].length;
					if (shapeCount <= 0) throw new Error("No polylines to draw. This should not happen.");

					const shape = this._shapesBeingDrawnByPhaseCode[phaseCode][shapeCount - 1];
					const isNew = !allShapes.some(s => s.id === shape.id)
					const isEachPhaseCode = getPhaseCode(phaseCode)?.type == 'EACH'

					if (isNew) {
						if (isEachPhaseCode) {
							shape.startDraw(docPt, null, selectedAttributes)
						} else {
							shape.startDraw(docPt, this._skippedPoint);
						}
						toCreate.push(shape);
					} else {
						shape.updateDraw(docPt, 1, selectedAttributes);
						toUpdate.push(shape);
					}
				})

				console.log("toCreate", toCreate, "toUpdate", toUpdate, "allShapes", allShapes.length)
				onShapesCreated(toCreate);
				onShapesUpdated(toUpdate);
			}

			this._skippedPoint = docPt;
		}
	}

	onMouseLeave = (e, hoveredShapes, extras) => { }

	onTouchStart = (e, hoveredShapes, extras) => {
		const { selectedTool, selectedScale, selectedBuildingArea, customScaleDisplay, selectedPhaseCode, setShapesBeingDrawn } = this.props
		const { visiblePhaseCodesWithValidAttributes } = this.props;
		const { isPolylineTool } = getCurrentTool(selectedTool);
		const { selectedShapesHovered, visibleShapesHovered } = hoveredShapes;
		const { docPt } = extras;

		// there is nothing to do if not the polyline tool
		if (!isPolylineTool) return;

		this._onTouchDownPoint = docPt;

		// use one line for tmp line, and just save persisted points
		if (!!this._tmpLine) this._tmpLine = null;

		// make sure we have an array
		if (!this._shapesBeingDrawnByPhaseCode) this._shapesBeingDrawnByPhaseCode = {};

		const validPhaseCodes = Object.keys(visiblePhaseCodesWithValidAttributes);
		validPhaseCodes.forEach(phaseCode => {
			const isEachPhaseCode = getPhaseCode(phaseCode)?.type === "EACH";

			if (!this._shapesBeingDrawnByPhaseCode[phaseCode]) this._shapesBeingDrawnByPhaseCode[phaseCode] = [];
			if (!this._shapesBeingDrawnByPhaseCode[phaseCode].length) {
				this._shapesBeingDrawnByPhaseCode[phaseCode].push(handleCreatePolyline({ selectedPhaseCode: phaseCode, selectedBuildingArea, selectedScale }));
			} else if (this._skippedPhaseCodes.includes(phaseCode)) {
				// todo: add initial point of last point
				this._shapesBeingDrawnByPhaseCode[phaseCode].push(handleCreatePolyline({ selectedPhaseCode: phaseCode, selectedBuildingArea, selectedScale }));
			} else if (isEachPhaseCode) {
				this._shapesBeingDrawnByPhaseCode[phaseCode].push(handleCreatePolyline({ selectedPhaseCode: phaseCode, selectedBuildingArea, selectedScale, customScaleDisplay }));
			}
		})

		const topmostShapes = Object.keys(this._shapesBeingDrawnByPhaseCode).map(phaseCode => {
			const shapeCount = this._shapesBeingDrawnByPhaseCode[phaseCode].length;
			return this._shapesBeingDrawnByPhaseCode[phaseCode][shapeCount - 1]
		}).filter(shape => !!shape);
		setShapesBeingDrawn(topmostShapes);
	}

	onTouchMove = (e, hoveredShapes, extras) => {
		const { containerSize, selectedTool, mapPos, setCursor, isNative } = this.props
		
		const { isPolylineTool } = getCurrentTool(selectedTool);

		if (!isPolylineTool) return;

		const { docPt } = extras;
	}

	onTouchEnd = (e, hoveredShapes, extras) => { 
		const { containerSize, selectedTool, setSelectedTool, mapPos, allShapes, addShapes, onShapesCreated, onShapesUpdated } = this.props
		const { selectedPhaseCodes, selectedPhaseCodesWithAttributes, visiblePhaseCodes, visiblePhaseCodesWithValidAttributes } = this.props;

		const { isPolylineTool } = getCurrentTool(selectedTool);

		if (!isPolylineTool) return;

		const { docPt } = extras;
		let isClick = false;

		if (!!this._onTouchDownPoint) {
			const dx = Math.abs(docPt.x - this._onTouchDownPoint.x);
			const dy = Math.abs(docPt.x - this._onTouchDownPoint.x);
			const dist2 = dx * dx + dy * dy;
			const tolerance2 = 10 * 10;

			isClick = dist2 < tolerance2;
		}

		if (isClick && !!this._shapesBeingDrawnByPhaseCode) {
			const validPhaseCodes = Object.keys(visiblePhaseCodesWithValidAttributes);

			this._skippedPhaseCodes = [];
			selectedPhaseCodes.forEach(phaseCode => {
				if (!validPhaseCodes.includes(phaseCode)) this._skippedPhaseCodes.push(phaseCode);
			})

			if (validPhaseCodes.length) {
				const toCreate = [];
				const toUpdate = [];

				validPhaseCodes.forEach(phaseCode => {
					const selectedAttributes = visiblePhaseCodesWithValidAttributes[phaseCode];
					const shapeCount = this._shapesBeingDrawnByPhaseCode[phaseCode].length;
					if (shapeCount <= 0) throw new Error("No polylines to draw. This should not happen.");

					const shape = this._shapesBeingDrawnByPhaseCode[phaseCode][shapeCount - 1];
					const isNew = !allShapes.some(s => s.id === shape.id)
					const isEachPhaseCode = getPhaseCode(phaseCode)?.type == 'EACH'

					if (isNew) {
						if (isEachPhaseCode) {
							shape.startDraw(docPt, null, selectedAttributes)
						} else {
							shape.startDraw(docPt, this._skippedPoint);
						}
						toCreate.push(shape);
					} else {
						shape.updateDraw(docPt, 1, selectedAttributes);
						toUpdate.push(shape);
					}
				})

				console.log("toCreate", toCreate, "toUpdate", toUpdate, "allShapes", allShapes.length)
				onShapesCreated(toCreate);
				onShapesUpdated(toUpdate);
			}

			this._skippedPoint = docPt;
		}
	}

	onUndo = () => {
		console.log("onUndo")
	}

	onRedo = () => {
		console.log("onRedo")
	}

	setProps(props) {
		this.props = props
		const { isPolylineTool } = getCurrentTool(this.props.selectedTool);
		if (!isPolylineTool) {
			this._skippedPoint = null;
			this._shapesBeingDrawnByPhaseCode = null
		}
	}
}

export default PolylinesCanvas
