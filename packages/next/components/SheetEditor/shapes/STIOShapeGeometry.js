import * as THREE from "three";
const { BufferGeometry, Float32BufferAttribute, Shape, ShapeUtils, Vector2 } = THREE;

class StioShapeGeometry extends BufferGeometry {
	constructor(shape) {
		super();
		this.type = 'StioShapeGeometry';

		const curveSegments = 12;
		this.parameters = { shapes: [ shape ], curveSegments };

		// allow single and array values for "shapes" parameter
		const { indices, vertices, normals, uvs } = this.addShape( shape );
		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );
	}

	addShape( shape ) {
		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];
		let groupCount = 0;

		const indexOffset = vertices.length / 3;
		const points = shape.extractPoints( this.parameters.curveSegments );

		let shapeVertices = points.shape;
		const shapeHoles = points.holes;

		// check direction of vertices

		if ( ShapeUtils.isClockWise( shapeVertices ) === false ) {

			shapeVertices = shapeVertices.reverse();

		}

		for ( let i = 0, l = shapeHoles.length; i < l; i ++ ) {

			const shapeHole = shapeHoles[ i ];

			if ( ShapeUtils.isClockWise( shapeHole ) === true ) {

				shapeHoles[ i ] = shapeHole.reverse();

			}

		}

		const faces = ShapeUtils.triangulateShape( shapeVertices, shapeHoles );

		// join vertices of inner and outer paths to a single array

		for ( let i = 0, l = shapeHoles.length; i < l; i ++ ) {

			const shapeHole = shapeHoles[ i ];
			shapeVertices = shapeVertices.concat( shapeHole );

		}

		// vertices, normals, uvs

		for ( let i = 0, l = shapeVertices.length; i < l; i ++ ) {

			const vertex = shapeVertices[ i ];

			vertices.push( vertex.x, vertex.y, 0 );
			normals.push( 0, 0, 1 );
			uvs.push( vertex.x, vertex.y ); // world uvs

		}

		// incides

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			const face = faces[ i ];

			const a = face[ 0 ] + indexOffset;
			const b = face[ 1 ] + indexOffset;
			const c = face[ 2 ] + indexOffset;

			indices.push( a, b, c );
			groupCount += 3;

		}

		return { groupCount, indices, vertices, normals, uvs };
	}

	updateShape(shape) {
		const { indices, vertices, normals, uvs } = this.addShape( shape );

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );
	}

	toJSON() {

		const data = super.toJSON();

		const shapes = this.parameters.shapes;

		return toJSON( shapes, data );

	}

	static fromJSON( data, shapes ) {

		const geometryShapes = [];

		for ( let j = 0, jl = data.shapes.length; j < jl; j ++ ) {

			const shape = shapes[ data.shapes[ j ] ];

			geometryShapes.push( shape );

		}

		return new ShapeGeometry( geometryShapes, data.curveSegments );

	}

}

function toJSON( shapes, data ) {

	data.shapes = [];

	if ( Array.isArray( shapes ) ) {

		for ( let i = 0, l = shapes.length; i < l; i ++ ) {

			const shape = shapes[ i ];

			data.shapes.push( shape.uuid );

		}

	} else {

		data.shapes.push( shapes.uuid );

	}

	return data;

}

export { StioShapeGeometry };

