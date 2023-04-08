import { PHASE_CODES, calculateLinearFeet, calculateSquareFeet, calculateTopSquareFeet, calculateQuantity } from "gmi-domain-logic";
import { deserializePolyline } from "../annotations/serializeAnnotations";
import { useDevConsole } from "../../../utils/src/util/useDevConsole";
const { logWarning } = useDevConsole();

// https://docs.google.com/document/d/1BQU9EkfXBtfvAU0uZGnWiYv-_S28tIfRj2fgkDhBqok/edit

// SQUARE FEET DISPLAY AND INPUT
// Input should be in square feet, they will put a decimal as need
// Display should be in square feet with a decimal

// LINEAR FEET AND INPUT
// Input and display should always be feet and inches

const _attributes = [
  {
    display: "Wall Height",
    shortDisplay: "Height",
    key: "wallHeight",
    presetVals: [8, 12, 24],
    unit: "ft",
    isValid: (val) => val['ft'] > 0 || val['in'] > 0,
    getValue: (val) => {
      const ft = val['ft'] || 0;
      const inches = val['in'] || 0;
      return ft + inches / 12;
    },
    inputs: [
      { key: "ft", display: "ft" },
      { key: "in", display: "in" },
    ],
  },
  {
    // should be added to 3256, 3257, 3260
    display: "Ply",
    shortDisplay: "Ply",
    key: "ply",
    presetVals: [1, 2, 3], // default to 1
    unit: "ply",
    default: { 'ply': 1, 'value': 1 },
    isValid: (val) => true,
    getValue: (val) => typeof val === 'number' ? val['ply'] : 1,
    inputs: [{ key: "ply", display: "" }],
  },
  {
    // aka - 'each'
    display: "Quantity",
    shortDisplay: "Qty",
    key: "each",
    presetVals: [],
    unit: "each",
    isValid: (val) => val['qty'] > 0,
    getValue: (val) => val['qty'],
    inputs: [{ key: "qty", display: "" }],
  }
];

export const phaseCodeAttributes = _attributes.map(attr => ({
  ...attr,
  get assignableProperties() {
    return this.presetVals.map(val => ({ type: attr.key, val }));
  }
}))

export const attributeLookupTable = Object.fromEntries(
  phaseCodeAttributes.map((a) => [a.key, a])
);

export const phaseCodes = PHASE_CODES.map((pc) => ({
  ...pc,
  description: `code: ${pc.code}`,
  budget: 1,
  get assignableAttributes() {
    return this.attributes.flatMap(attrName => ((attributeLookupTable[attrName] || {}).assignableProperties || []));
  }
}));

export const phaseCodeLookupTable = Object.fromEntries(phaseCodes.map(pc => [pc.code, pc]));
export const getPhaseCode = (code) => phaseCodeLookupTable[code] || null;
export { default as SCALES } from "./constants/scales";
