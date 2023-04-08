import TextSearchShape from "../canvas-react/shapes/textSearch";

export const getTextSearchShapes = (textSearchMatches) => {
	const highlights = [];
	
	(textSearchMatches || []).forEach((textSearchMatch, index) => {
		const vertices = textSearchMatch.boundingBox.vertices || [];
		
		const id = vertices[0].x + '_' + vertices[0].y + '_' + index;

		const shapeData = {
			id: id,
			poly: {
				ptArray: [
					{ x: vertices[0].x, y: vertices[0].y },
					{ x: vertices[1].x, y: vertices[1].y },
					{ x: vertices[2].x, y: vertices[2].y },
					{ x: vertices[3].x, y: vertices[3].y }
				]
			}
		}
		highlights.push(new TextSearchShape(id, shapeData, { published: true }))
	});

	return highlights;
}
