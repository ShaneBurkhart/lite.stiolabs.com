class ImageCanvas {
	constructor() {
		this.utils = null
		this.canvasSize = null
		this.containerSize = null
		this.mapPos = null
		this.selectedTool = null
		this.shapes = []
		this.selectedShapes = []
		this.scale = 1
	}
	setUtils = (utils) => { this.utils = utils }
	setImageSize = (imageSize) => { this.imageSize = imageSize }
	setCanvasSize = (canvasSize) => { this.canvasSize = canvasSize}
	setMapPos = (mapPos) => { 
		this.mapPos = mapPos 
	}
	setContainerSize = (containerSize) => { this.containerSize = { x: 0, y: 0, ...containerSize } }
	setSheet = (sheet) => { 
		this.sheet = sheet 
	}

	setSelectedShapes = (shapes) => { 
		this.selectedShapes = shapes 
	}

	setSelectedTool = (selectedTool) => { }

	setSelectedColor = (selectedColor) => { this.selectedColor = selectedColor }

	onMouseDown = (e) => { }

	onMouseMove = (e) => { }

	onMouseUp = (e) => { }

	onMouseLeave = (e) => { }

	onTouchStart = (e) => { }

	onTouchMove = (e) => { }

	onTouchEnd = (e) => { }

	setupScene(scene, sheet) {
		if (!scene || !sheet) return;
		const width = parseInt(sheet.width, 10)
		const height = parseInt(sheet.height, 10)

		const sheetUrl = sheet.fullImgUrl;

		// this.renderer.stage.removeChild(this.graphics)

		console.log("Draw", this.scale)
		this.utils.createSheetImage(sheetUrl, (mesh) => {
			mesh.position.x = 0
			mesh.position.y = 0
			mesh.position.z = 0

			scene.add(mesh)
		})


		// this.graphics.width = parseInt(this.sheet.width, 10)
		// this.graphics.height = parseInt(this.sheet.height, 10)
		
		// this.graphics.scale.set(scale, scale)
		// this.graphics.position = { x: -Math.round(width/2), y: Math.round(height/2) }
		// this.graphics.position = { x: -width/2+(width * scale)/2, y: height/2+(height * scale)/2 }

		// if (this.graphics) this.canvasGroup.add(this.graphics, 0)
	}
}

export default ImageCanvas
