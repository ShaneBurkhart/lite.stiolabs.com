import React, { useRef, useMemo, } from "react";
import _ from "underscore";

import { extend, Canvas, useThree, useFrame, useLoader, } from "@react-three/fiber";
import * as THREE from "three";
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "three.meshline";

extend({ MeshLine, MeshLineMaterial, MeshLineRaycast });
const { TextureLoader, LinearFilter, ClampToEdgeWrapping } = THREE;

// import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
// extend({ TextGeometry });

const Sheet = ({ children, containerSize, mapPos, sheetWidth: width, sheetHeight: height, src }) => {
  // The first step is to load the image into a texture that we can use in WebGL
  const texture = useLoader(TextureLoader, src);
  // Then we want to get the viewport from ThreeJS so we can do some calculations later
  const { viewport } = useThree();
  // We need to apply some corrections to the texture we've just made
  useMemo(() => {
    // texture.encoding = THREE.sRGBEncoding;
    // texture.generateMipmaps = false
    // texture.wrapS = texture.wrapT = ClampToEdgeWrapping
    // texture.minFilter = LinearFilter
    // texture.needsUpdate = true
  }, [ texture.generateMipmaps, texture.wrapS, texture.wrapT, texture.minFilter, texture.needsUpdate ]);

  const scaleX = (width / mapPos.scale / containerSize.width) * viewport.width;
  const scaleY = (height / mapPos.scale / containerSize.height) * viewport.height;

  const posX = scaleX / 2 - (mapPos.translation.x / mapPos.scale / containerSize.width) * viewport.width;
  const posY = -scaleY / 2 + (mapPos.translation.y / mapPos.scale / containerSize.height) * viewport.height;

  // Here we grab the size and position of the image from the DOM
  return (
    <group
      // We convert the width and height to relative viewport units
      scale={[scaleX, scaleY, 1]}
      // We convert the x and y positions to relative viewport units
      position={[posX, posY, 0]}
    >
      <mesh>
        {/* We're use a simple plane geometry */}
        {/* think of it like a piece of paper as a 3d shape */}
        <planeBufferGeometry attach="geometry" />
        {/* Finally we map the texture to a material */}
        {/* or in other terms, put the image on the shape */}
        <meshBasicMaterial
          attach="material"
          map={texture}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {children}
    </group>
  );
};




const GLReactDrawing = React.memo(function GLReactDrawing(props) {
  const { children, handlers, containerSize, mapPos, sheet } = props;
  const sheetUrl = sheet.fullImgUrl;
  const sheetWidth = parseInt(sheet.width, 10);
  const sheetHeight = parseInt(sheet.height, 10);
  const backgroundImageStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  };

  return (
    <div style={backgroundImageStyle} {...handlers}>
      <Canvas
        frameloop="demand"
        orthographic
        shadows={false}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl, scene }) => {
          // gl.outputEncoding = THREE.sRGBEncoding
          // scene.background = new THREE.Color('#373740')
        }}
      >
        <Sheet
          mapPos={mapPos}
          containerSize={containerSize}
          sheetWidth={sheetWidth}
          sheetHeight={sheetHeight}
          src={sheetUrl}
        >
          {children}
        </Sheet>
      </Canvas>
    </div>
  );
});

const WebGLCanvas = React.memo(function WebGLCanvas(props) {
  const {
    children,
    app,
    sheet,
    mapPos,
    initCanvas,
    setStagePos,
    setStageScale,
    containerSize,
    handlers,
    canPanAndZoom,
    onClick,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
  } = props;

  const _lastCanvasPanPos = useRef(null);
  const _canvas = useRef(null);
  const _wheelHandler = useRef(null);
  const _wheelWindowListener = useRef(null);

  _wheelHandler.current = (e) => {
    e.preventDefault();

    const { scale, translation } = mapPos;

    const deltaScale = (e.deltaY / 1000) * scale;
    const newScale = scale + deltaScale;
    const diffX = containerSize.width / 2 - e.clientX + containerSize.x;
    const diffY = containerSize.height / 2 - e.clientY + containerSize.y;
    const newX = translation.x + diffX * (newScale - scale);
    const newY = translation.y + diffY * (newScale - scale);

    setStageScale(newScale, newX, newY);
  };

  return (
    <div
      className="relative h-full"
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
      onMouseDown={(e) => {
        _lastCanvasPanPos.current = { x: e.clientX, y: e.clientY };

        if (onMouseDown) onMouseDown(e);
      }}
      onMouseMove={(e) => {
        const canPan = canPanAndZoom && canPanAndZoom();

        if (_lastCanvasPanPos.current && canPan) {
          const deltaX = _lastCanvasPanPos.current.x - e.clientX;
          const deltaY = _lastCanvasPanPos.current.y - e.clientY;

          setStagePos(
            mapPos.translation.x + deltaX * mapPos.scale,
            mapPos.translation.y + deltaY * mapPos.scale
          );
          _lastCanvasPanPos.current = { x: e.clientX, y: e.clientY };
        }

        if (onMouseMove) onMouseMove(e);
      }}
      onMouseUp={(e) => {
        _lastCanvasPanPos.current = null;
        if (onMouseUp) onMouseUp(e);
      }}
      onMouseLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        _lastCanvasPanPos.current = null;

        if (onMouseLeave) onMouseLeave(e);
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        _lastCanvasPanPos.current = { x: e.clientX, y: e.clientY };

        if (onTouchStart) onTouchStart(e);
      }}
      onTouchMove={(e) => {
        const canPan = canPanAndZoom && canPanAndZoom();

        if (_lastCanvasPanPos.current && canPan) {
          const deltaX = _lastCanvasPanPos.current.x - e.clientX;
          const deltaY = _lastCanvasPanPos.current.y - e.clientY;

          setStagePos(
            mapPos.translation.x + deltaX / mapPos.scale,
            mapPos.translation.y + deltaY / mapPos.scale
          );
          _lastCanvasPanPos.current = { x: e.clientX, y: e.clientY };
        }

        if (onTouchMove) onTouchMove(e);
      }}
      onTouchEnd={(e) => {
        _lastCanvasPanPos.current = null;
        if (onTouchEnd) onTouchEnd(e);
      }}
      onTouchCancel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        _lastCanvasPanPos.current = null;
        if (onTouchCancel) onTouchCancel(e);
      }}
      ref={(ref) => {
        if (ref && ref !== _canvas.current) {
          const wheelWindowListener = (e) => {
            if (_wheelHandler.current) _wheelHandler.current(e);
          };

          if (_canvas.current && _wheelWindowListener.current) {
            _canvas.current.removeEventListener( "wheel", _wheelWindowListener.current, { passive: false } );
          }

          console.log("INIT SCROLL WHEEL LISTENER");
          ref.addEventListener("wheel", wheelWindowListener, {
            passive: false,
          });

          _wheelWindowListener.current = wheelWindowListener;
          _canvas.current = ref;
        }
      }}
    >
      <GLReactDrawing
        containerSize={containerSize}
        handlers={handlers}
        mapPos={mapPos}
        sheet={sheet}
      >
        {children}
      </GLReactDrawing>
    </div>
  );
});

export default WebGLCanvas;
