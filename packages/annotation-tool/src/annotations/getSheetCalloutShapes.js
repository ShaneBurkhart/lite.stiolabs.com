import homoglyphSearch from "homoglyph-search";
import CalloutShape from "../canvas-react/shapes/links/callout";

export const getSheetCalloutShapes = (allSheets, detectedText, currentSheet) => {
	const links = [];
	
	(detectedText?.Circles || []).forEach(text => {
		const blocks = text.data || []
		const match = (allSheets || []).find((sheet, i) => {
			return blocks.find(block => {
				const results = homoglyphSearch.search(block.DetectedText, [sheet.num])
				return results && results.length > 0
			})
		});
		
		if (!match) return
		
    const left = text.circle.x - text.circle.r;
		const right = text.circle.x + text.circle.r;
		const top = text.circle.y - text.circle.r;
		const bottom = text.circle.y + text.circle.r;
	
    const id = match.id + '_' + left + '_' + top;
		const shapeData = {
      linkRef: match.id,
			poly: {
				ptArray: [
					{ x: left, y: top },
					{ x: right, y: top },
					{ x: right, y: bottom },
					{ x: left, y: bottom }
				]
			}
		}
		const sameSheet = currentSheet?.id === match.id; //TODO: published: !sameSheet ?
		links.push(new CalloutShape(id, shapeData, { published: true }))
	});

	return links;
}
