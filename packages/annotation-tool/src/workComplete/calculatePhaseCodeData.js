import { deserializePolyline } from '../annotations/serializeAnnotations';
import { getPhaseCode, _phaseCodes } from './phaseCodes';

export const getPercentageCompleted = (total=0, completed=0) => {
  if (total === 0) return null;
  return Math.round(completed / total * 100);
}

const _initialCount = { budgetTotal: 0, totalDrawn: 0, completed: 0 };

const updateCounts = (obj, budgetTotal, totalDrawn, completed) => {
  obj.totalDrawn += totalDrawn;
  obj.completed += completed;
  obj.percentage = getPercentageCompleted(budgetTotal, obj.completed);
}

export const calculatePhaseCodeData = (phaseCodeBudgets=[], workCompletes=[]) => {
  const phaseCodeBudgetLookupTable = Object.fromEntries(phaseCodeBudgets.map(pcBudget => [pcBudget.phaseCode, pcBudget.budget]));
  const getBudget = phaseCode => phaseCodeBudgetLookupTable[phaseCode] || 0;

  const totalsByPhaseCode = {};

  // create an entry for each phase code and add it's budget
  (_phaseCodes || []).forEach(pc => {
    if (totalsByPhaseCode[pc.code]) return;

    totalsByPhaseCode[pc.code] = { 
      name: pc.name, 
      unitDisplay: pc.unitDisplay, 
      areaTotals: {},
      ..._initialCount, 
      budgetTotal: getBudget(pc.code)
    };
  })

  workCompletes.forEach(wc => {
    const code = wc.shapeData?.phaseCode;
    const currentTotal = totalsByPhaseCode[code];
    const pc = getPhaseCode(code);
    if (!currentTotal || !pc) return;

    const budgetTotal = currentTotal.budgetTotal;

    const sheetNum = wc.sheetNum;
    const buildingArea = wc.buildingArea + '';

    // init area totals
    if (!currentTotal.areaTotals[buildingArea]) {
      currentTotal.areaTotals[buildingArea] = { area: buildingArea, sheetNums: [], ..._initialCount };
    }
    // add sheet nums to area totals
    if (!currentTotal.areaTotals[buildingArea].sheetNums.includes(sheetNum)) {
      currentTotal.areaTotals[buildingArea].sheetNums.push(sheetNum);
    }

    const { totalDrawn, completed } = pc.formula(deserializePolyline(wc));
    updateCounts(currentTotal, budgetTotal, totalDrawn, completed);
    updateCounts(currentTotal.areaTotals[buildingArea], budgetTotal, totalDrawn, completed);
  })

  return totalsByPhaseCode
};
