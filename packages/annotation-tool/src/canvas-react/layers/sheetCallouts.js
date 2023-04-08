import Coords from "../geometry/coords";
import Point from "../geometry/point";
import { getSheetCalloutShapes } from "../../annotations/getSheetCalloutShapes";

class SheetCalloutsCanvas {
	constructor() {
		this._mouseDownPos = null
		this._lastDetectedText = null;
	}

	onMouseDown = (e, hoveredShapes, extras) => {
		const { setCursor } = this.props

		this._mouseDownPos = { x: e.clientX, y: e.clientY };

		setCursor('pointer');
	}

	onMouseMove = (e, hoveredShapes, extras) => {
		const { setCursor } = this.props
		const { calloutShapesHovered } = hoveredShapes;
		const isCalloutHovered = calloutShapesHovered[0]?.constructorName === 'CalloutShape';

		if (isCalloutHovered) setCursor('pointer');
	}

	onMouseUp = (e, hoveredShapes, extras) => {
		const { containerSize, setSheet, mapPos, setCursor } = this.props
		const { docPt } = extras;

		if (this._mouseDownPos) {
			const { calloutShapesHovered } = hoveredShapes;
			const isCalloutHovered = calloutShapesHovered[0]?.constructorName === 'CalloutShape';

			if (isCalloutHovered && this._mouseDownPos) {
				const dx = e.clientX - this._mouseDownPos.x;
				const dy = e.clientY - this._mouseDownPos.y;
				const dist2 = Math.abs(dx * dx) + Math.abs(dy * dy)
				const tolerance2 = 20 * 20
				const isSameTouch = dist2 < tolerance2

				if (isSameTouch && setSheet) setSheet({ id: calloutShapesHovered[0]?.linkRef })
			}
		}

		setCursor('pointer');
	}

	onMouseLeave = (e, hoveredShapes, extras) => {
		this.onMouseUp(e, hoveredShapes, extras)
	}

	onTouchStart = (e, hoveredShapes, extras) => {
		const touch = e.nativeEvent.touches[0]
		this._mouseDownPos = { x: touch.locationX, y: touch.locationY };
	}

	onTouchMove = (e, hoveredShapes, extras) => { }

	onTouchEnd = (e, hoveredShapes, extras) => { 
		const { setSheet, allSheets } = this.props
		const { docPt } = extras;

		const touch = e.nativeEvent.changedTouches[0]

		if (this._mouseDownPos) {
		const { calloutShapesHovered } = hoveredShapes;
		const isCalloutHovered = calloutShapesHovered && calloutShapesHovered[0]?.constructorName === 'CalloutShape';

			if (isCalloutHovered && this._mouseDownPos) {
				const dx = touch.locationX - this._mouseDownPos.x;
				const dy = touch.locationY - this._mouseDownPos.y;
				const dist2 = Math.abs(dx * dx) + Math.abs(dy * dy)
				const tolerance2 = 20 * 20
				const isSameTouch = dist2 < tolerance2

				const newSheet = allSheets.find(s => s.id === calloutShapesHovered[0]?.linkRef)
				if (isSameTouch && setSheet && newSheet) setSheet(newSheet)
			}
		}
	}

	setProps(props) {
		this.props = props
		const { sheet, allSheets, detectedText, setCalloutLinks } = props

		if (this._lastDetectedText !== detectedText) {
      this._lastDetectedText = detectedText;
      this.links = [];

      if (detectedText) {
				this.links = getSheetCalloutShapes(allSheets, detectedText, sheet);
				setCalloutLinks(this.links)
			}
    }
	}
}

export default SheetCalloutsCanvas
