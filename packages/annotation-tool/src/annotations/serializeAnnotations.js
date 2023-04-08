import * as shapeConstructors from "gmi-annotation-tool/dist/canvas-react/shapes/index";
import { phaseCodeLookupTable } from '../workComplete/phaseCodes';
import { useDevConsole } from "../../../utils/src/util/useDevConsole";
const uuid = require("uuid").v4;

const { logWarning } = useDevConsole();

const exitWithWarning = (...args) => {
  logWarning(...args);
  return null;
}

export const serialize = instance => JSON.parse(JSON.stringify(instance));

export const serializeForUndo = (instance, sheetId) => {
  const raw = serialize(instance);
  return {
    sheetId,
    id: instance.id,
    type: instance.constructorName || '',
    published: instance.published,
    shapeData: raw.shapeData,
  }
}

export const serializePolylineForUndo = (instance, sheetNum, buildingArea) => {
  const raw = serialize(instance);
  return {
    sheetNum,
    buildingArea,
    id: instance.id,
    type: instance.constructorName || '',
    published: instance.published,
    shapeData: raw.shapeData,
  }
}

export const serializeForCopy = (instance) => {
  const raw = serialize(instance);

  //TODO: position edgecases (end of canvas / cross sheet paste, mouse pos, etc)
  raw.shapeData.poly?.ptArray?.forEach(p => {
    p.x += 100;
    p.y += 100;
  });

  return {
    type: instance.constructorName || '',
    shapeData: raw.shapeData,
  }
}

export const serializePolylineForCopyToNewPhaseCode = (instance, newPhaseCode, isCopyComplete=false) => {
  const raw = serialize(instance);
  raw.shapeData.phaseCode = newPhaseCode;

  if (!isCopyComplete) {
    raw.shapeData.attrArray = (raw.shapeData?.attrArray || []).map(attr => (
      { ...attr, isComplete: false }
    ));
  } else {
    raw.shapeData.attrArray = (raw.shapeData?.attrArray || []).map(attr => (
      { ...attr, isComplete: true }
    ));
  }

  return {
    type: instance.constructorName || '',
    shapeData: raw.shapeData,
  }
}

export const deserialize = (annotation, project) => {
  if (!annotation || !project) return;

  const { id, type, shapeData, published } = annotation;
  
  if (!shapeConstructors[type]) return false;
  let _project;
  
  if (["StampShape"].includes(type)) _project = project; //TODO: just send to all shapes?
  
  const Shape = shapeConstructors[type];
  // if it a stamp shape add project as 4th param
  return new Shape(id, shapeData, { published }, project);
}


export const deserializePolyline = (workComplete) => {
  if (!workComplete) return null;

  const { id, type, shapeData, published } = workComplete;
  if (!type || type !== 'PolylineShape') return exitWithWarning('Provided workComplete is not a polyline shape %o', {workComplete});
  if (!shapeData?.phaseCode) return exitWithWarning('Provided workComplete does not have a phase code %o', {workComplete});
  if (!phaseCodeLookupTable[shapeData.phaseCode]) return exitWithWarning('Provided workComplete phaseCode does not exist on phaseCodes primitive %o', {workComplete});
  if (!shapeData.attrArray) return exitWithWarning('Provided workComplete does not have an attribute array %o', {workComplete});
  
  const Shape = shapeConstructors[type];
  return new Shape(id, shapeData, { published });
}


export const deserializeForCopy = (annotation, project) => {
  if (!annotation || !project) return;

  const { type, shapeData } = annotation;
  const id = uuid();
  
  if (!shapeConstructors[type]) return false;
  let _project;
  if (["StampShape"].includes(type)) _project = project; //TODO: just send to all shapes?

  
  const Shape = shapeConstructors[type];
  return new Shape(id, shapeData, {}, _project); // all three params must be present, or shape constructors will default to creating a brand new shape (and errors will be thrown)
}
