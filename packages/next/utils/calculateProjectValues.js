
export default function calculateProjectValues(project) {
  const units = project.units || [];
  const accounts = project.accounts || [];
  const markedCompleted = project.markedCompleted || {};
  const takeoffData = project.takeoffData || {};

  const unitsProduction = units.map(unit => {
    const accountsMarkedCompleted = markedCompleted[unit.name] || {};
    const unitTakeoffData = takeoffData[unit.name] || {};
    const unitCount = 1;
    const completedSqft = accounts.reduce((acc, account) => {
      const takeoffData = unitTakeoffData[account.name] || 0;
      const completed = accountsMarkedCompleted[account.name] || 0;
      const accountCompleted = takeoffData * completed;
      return acc + accountCompleted;
    }, 0);

    const totalSqft = accounts.reduce((acc, account) => {
      const takeoffData = unitTakeoffData[account.name] || 0;
      const accountTotal = takeoffData * unitCount;
      return acc + accountTotal;
    }, 0);
    const completedSqftProgress = totalSqft === 0 ? 0 : completedSqft / totalSqft * 100;

    const accountStats = accounts.reduce((acc, account) => {
      const takeoffData = unitTakeoffData[account.name] || 0;
      const completed = accountsMarkedCompleted[account.name] || 0;
      const accountCompleted = takeoffData * completed;
      const accountTotal = takeoffData * unitCount;
      const accountProgress = accountTotal === 0 ? 0 : accountCompleted / accountTotal * 100;
      acc[account.name] = { completed: accountCompleted, total: accountTotal, progress: accountProgress };
      return acc;
    }, {});

    return {
      name: unit.name,
      completedSqft,
      totalSqft,
      completedSqftProgress,
      accounts: accountStats,
    };
  });

  const totalCompletedSqft = unitsProduction.reduce((acc, unit) => acc + unit.completedSqft, 0);
  const totalSqft = unitsProduction.reduce((acc, unit) => acc + unit.totalSqft, 0);
  const totalCompletedSqftProgress = totalSqft === 0 ? 0 : totalCompletedSqft / totalSqft * 100;

  const accountTotals = accounts.reduce((acc, account) => {
    const accountCompleted = unitsProduction.reduce((sum, unit) => sum + unit.accounts[account.name].completed, 0);
    const accountTotal = unitsProduction.reduce((sum, unit) => sum + unit.accounts[account.name].total, 0);
    const accountProgress = accountTotal === 0 ? 0 : accountCompleted / accountTotal * 100;
    acc[account.name] = { completed: accountCompleted, total: accountTotal, progress: accountProgress };
    return acc;
  }, {});

  return {
    completed: totalCompletedSqft,
    total: totalSqft,
    progress: totalCompletedSqftProgress,
    units: Object.fromEntries(unitsProduction.map(unit => [unit.name, unit])),
    accounts: accountTotals,
  };
}
