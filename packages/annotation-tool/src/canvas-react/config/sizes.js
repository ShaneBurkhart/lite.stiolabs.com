export const strokeWidth = 10;
export const highlightWidth = 50;
export const bezierWidth = 25;
export const arrowSize = 30;
export const markWidth = 30;

export const mobileStrokeWidth = 10;
export const mobileHighlightWidth = 50;
export const mobileBezierWidth = 25;
export const mobileArrowSize = 30;
export const mobileMarkWidth = 50;

export const cornerTolerance = 30;
export const hoverTolerance = 20;
export const mobileCornerTolerance = 100;
export const mobileHoverTolerance = 100;

export const polylineStrokeWidth = 10;
export const polylineDotTolerance = 7;
export const polylineLineTolerance = 10;
export const mobilePolylineStrokeWidth = 20;
export const mobilePolylineDotTolerance = 20;
export const mobilePolylineLineTolerance = 20;
// export const polylineHoverTolerance = 20;
// export const polylineMobileCornerTolerance = 100;
// export const polylineMobileHoverTolerance = 100;

export const dimensionTextSize = 70;

export const MIN_LENGTH_THRESHOLD = 25;
export const MIN_AREA_THRESHOLD = 20;

export const getDrawingSizes = (isTouch, scale) => {
	scale = Math.max(Math.min(scale, 1.5), 1)

	if (isTouch) {
		// isNative is both touch from web and native
		return { 
			strokeWidth: mobileStrokeWidth * scale,
			highlightWidth: mobileHighlightWidth * scale,
			bezierWidth: mobileBezierWidth * scale,
			arrowSize: mobileArrowSize * scale,
			markWidth: mobileMarkWidth * scale,
			dimensionTextSize: dimensionTextSize * scale,
		}
	} else {
		return { 
			strokeWidth: strokeWidth * scale,
			highlightWidth: highlightWidth * scale,
			bezierWidth: bezierWidth * scale,
			arrowSize: arrowSize * scale,
			markWidth: markWidth * scale,
			dimensionTextSize: dimensionTextSize * scale,
		}
	}
}

export const getTolerances = (isTouch, scale) => {
	scale = Math.min(2, scale)
	if (isTouch) {
		// isNative is both touch from web and native
		return { corner: mobileCornerTolerance * scale, hover: mobileHoverTolerance * scale }
	} else {
		return { corner: cornerTolerance * scale, hover: hoverTolerance * scale }
	}
}

export const getPolylineDrawingSizes = (isTouch, scale) => {
	scale = Math.max(Math.min(scale, 4), .25)
	// isNative is both touch from web and native
	const _strokeWidth = isTouch ? mobilePolylineStrokeWidth : polylineStrokeWidth;

	return { 
		strokeWidth: Math.ceil(_strokeWidth * scale),
	}
}

export const getPolylineTolerances = (isTouch, scale) => {
	scale = Math.min(2, scale)
	if (isTouch) {
		// isNative is both touch from web and native
		return { 
			dot: mobilePolylineDotTolerance / scale, 
			line: mobilePolylineLineTolerance / scale 
		}
	} else {
		return { 
			dot: polylineDotTolerance / scale, 
			line: polylineLineTolerance / scale 
		}
	}
}
