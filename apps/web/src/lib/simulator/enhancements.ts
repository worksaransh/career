// Future Simulator Enhancement — Monte Carlo simulations and outcome projections

export interface SimulationConfig {
  careerTitle: string;
  currentAge: number;
  currentSalary: number;
  savingsRate: number;
  educationDebt: number;
  yearsToProject: number;
  growthRate: number;
  volatility: number;
  numSimulations: number;
}

export interface SimulationResult {
  medianPath: SimulationYear[];
  optimisticPath: SimulationYear[];
  pessimisticPath: SimulationYear[];
  summary: SimulationSummary;
}

export interface SimulationYear {
  year: number;
  age: number;
  salary: number;
  savings: number;
  netWorth: number;
}

export interface SimulationSummary {
  medianNetWorthAtEnd: number;
  optimisticNetWorthAtEnd: number;
  pessimisticNetWorthAtEnd: number;
  yearsToDebtFree: number;
  peakEarningAge: number;
  totalLifetimeEarnings: number;
  confidenceLevel: number;
}

export function runMonteCarloSimulation(config: SimulationConfig): SimulationResult {
  const {
    currentAge,
    currentSalary,
    savingsRate,
    educationDebt,
    yearsToProject,
    growthRate,
    volatility,
    numSimulations,
  } = config;

  const allSimulations: SimulationYear[][] = [];

  for (let sim = 0; sim < numSimulations; sim++) {
    const path: SimulationYear[] = [];
    let salary = currentSalary;
    let savings = 0;
    let debt = educationDebt;
    let age = currentAge;

    for (let y = 0; y <= yearsToProject; y++) {
      const randomFactor = gaussianRandom();
      const annualGrowth = growthRate + randomFactor * volatility;
      salary *= 1 + annualGrowth;

      const annualSavings = salary * savingsRate;
      savings += annualSavings;

      if (debt > 0) {
        const payment = Math.min(annualSavings * 0.3, debt);
        debt -= payment;
      }

      const netWorth = savings - debt;

      path.push({
        year: y,
        age: age + y,
        salary: Math.round(salary),
        savings: Math.round(savings),
        netWorth: Math.round(netWorth),
      });
    }

    allSimulations.push(path);
  }

  const medianPath = percentilePath(allSimulations, 0.5);
  const optimisticPath = percentilePath(allSimulations, 0.9);
  const pessimisticPath = percentilePath(allSimulations, 0.1);

  const finalNetWorths = allSimulations.map((p) => p[p.length - 1]?.netWorth ?? 0).sort((a, b) => a - b);
  const medianFinal = finalNetWorths[Math.floor(finalNetWorths.length * 0.5)] ?? 0;
  const optimisticFinal = finalNetWorths[Math.floor(finalNetWorths.length * 0.9)] ?? 0;
  const pessimisticFinal = finalNetWorths[Math.floor(finalNetWorths.length * 0.1)] ?? 0;

  return {
    medianPath,
    optimisticPath,
    pessimisticPath,
    summary: {
      medianNetWorthAtEnd: medianFinal,
      optimisticNetWorthAtEnd: optimisticFinal,
      pessimisticNetWorthAtEnd: pessimisticFinal,
      yearsToDebtFree: educationDebt > 0 ? Math.ceil(educationDebt / Math.max(currentSalary * savingsRate * 0.3, 1)) : 0,
      peakEarningAge: currentAge + Math.min(yearsToProject, Math.round(20 / (1 + volatility))),
      totalLifetimeEarnings: Math.round(allSimulations.map((p) => p.reduce((s, y) => s + y.salary, 0)).reduce((a, b) => a + b, 0) / numSimulations),
      confidenceLevel: Math.round(70 - volatility * 100),
    },
  };
}

function gaussianRandom(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function percentilePath(simulations: SimulationYear[][], percentile: number): SimulationYear[] {
  const numYears = simulations[0]!.length;
  const path: SimulationYear[] = [];

  for (let y = 0; y < numYears; y++) {
    const values = simulations.map((s) => s[y]!).filter(Boolean);
    const netWorths = values.map((v) => v.netWorth).sort((a, b) => a - b);
    const salaries = values.map((v) => v.salary).sort((a, b) => a - b);
    const savings = values.map((v) => v.savings).sort((a, b) => a - b);

    const idx = Math.floor(values.length * percentile);
    path.push({
      year: y,
      age: values[0]!.age,
      salary: salaries[idx] ?? 0,
      savings: savings[idx] ?? 0,
      netWorth: netWorths[idx] ?? 0,
    });
  }

  return path;
}
