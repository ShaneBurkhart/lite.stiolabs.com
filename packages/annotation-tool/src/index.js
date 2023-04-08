import AnnotationWorkspace from './canvas-react/workspaces/AnnotationWorkspace'
import WorkCompleteWorkspace from './canvas-react/workspaces/WorkCompleteWorkspace'
import { closePolyline } from './canvas-react/shapes/polyline'

import {
  serialize,
  serializeForCopy,
  serializeForUndo,
  serializePolylineForUndo,
  serializePolylineForCopyToNewPhaseCode,
  deserialize,
  deserializeForCopy,
  deserializePolyline,
} from "./annotations/serializeAnnotations";

import { getSheetCalloutShapes } from "./annotations/getSheetCalloutShapes";

import { getTextSearchShapes } from "./annotations/getTextSearchShapes";

import {
  SCALES,
  phaseCodes,
  getPhaseCode,
  phaseCodeAttributes,
  attributeLookupTable,
  phaseCodeLookupTable,
} from './workComplete/phaseCodes';

import {
  calculatePhaseCodeData,
} from './workComplete/calculatePhaseCodeData';


export {
  closePolyline,
  AnnotationWorkspace,
  WorkCompleteWorkspace,

  serialize,
  serializeForCopy,
  serializeForUndo,
  serializePolylineForUndo,
  serializePolylineForCopyToNewPhaseCode,
  deserialize,
  deserializeForCopy,
  deserializePolyline,
  getSheetCalloutShapes,
  getTextSearchShapes,

  SCALES,
  phaseCodes,
  getPhaseCode,
  phaseCodeAttributes,
  attributeLookupTable,
  phaseCodeLookupTable,

  calculatePhaseCodeData,
}
