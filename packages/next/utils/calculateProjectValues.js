
export default function calculateProjectValues(project) {
  const units = project.units || [];
  const accounts = project.accounts || [];
  const markedCompleted = project.markedCompleted || {};
  const takeoffData = project.takeoffData || {};

  const unitsProduction = units.map(unit => {
    const accountsMarkedCompleted = markedCompleted[unit.id] || {};
    const unitTakeoffData = takeoffData[unit.id] || {};
    const unitCount = 1;
    const completedSqft = accounts.reduce((acc, account) => {
      const takeoffData = unitTakeoffData[account.id] || 0;
      const completed = accountsMarkedCompleted[account.id] || 0;
      const accountCompleted = takeoffData * completed;
      return acc + accountCompleted;
    }, 0);

    const totalSqft = accounts.reduce((acc, account) => {
      const takeoffData = unitTakeoffData[account.id] || 0;
      const accountTotal = takeoffData * unitCount;
      return acc + accountTotal;
    }, 0);
    const completedSqftProgress = totalSqft === 0 ? 0 : completedSqft / totalSqft * 100;

    const accountStats = accounts.reduce((acc, account) => {
      const takeoffData = unitTakeoffData[account.id] || 0;
      const completed = accountsMarkedCompleted[account.id] || 0;
      const accountCompleted = takeoffData * completed;
      const accountTotal = takeoffData * unitCount;
      const accountProgress = accountTotal === 0 ? 0 : accountCompleted / accountTotal * 100;
      acc[account.id] = { completed: accountCompleted, total: accountTotal, progress: accountProgress, isCompleted: !!completed };
      return acc;
    }, {});

    const isUnitCompleted = Object.values(accountStats).every(account => account.isCompleted);

    return {
      id: unit.id,
      name: unit.name,
      completedSqft,
      totalSqft,
      completedSqftProgress,
      isCompleted: isUnitCompleted,
      accounts: accountStats,
    };
  });

  const totalCompletedSqft = unitsProduction.reduce((acc, unit) => acc + unit.completedSqft, 0);
  const totalSqft = unitsProduction.reduce((acc, unit) => acc + unit.totalSqft, 0);
  const totalCompletedSqftProgress = totalSqft === 0 ? 0 : totalCompletedSqft / totalSqft * 100;

  const accountTotals = accounts.reduce((acc, account) => {
    const accountCompleted = unitsProduction.reduce((sum, unit) => sum + unit.accounts[account.id].completed, 0);
    const accountTotal = unitsProduction.reduce((sum, unit) => sum + unit.accounts[account.id].total, 0);
    const accountProgress = accountTotal === 0 ? 0 : accountCompleted / accountTotal * 100;
    const isAccountCompleted = unitsProduction.every(unit => unit.accounts[account.id].isCompleted);
    acc[account.id] = { completed: accountCompleted, total: accountTotal, progress: accountProgress, isCompleted: isAccountCompleted };
    return acc;
  }, {});

  const last30Days = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
    last30Days.push({ name: formattedDate, "Total Production": Math.round(Math.random() * 1000) })
  }

  return {
    completed: totalCompletedSqft,
    total: totalSqft,
    progress: totalCompletedSqftProgress,
    units: Object.fromEntries(unitsProduction.map(unit => [unit.id, unit])),
    accounts: accountTotals,
    last30Days,
  };
}
