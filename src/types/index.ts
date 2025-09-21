export interface StockMetrics {
  pe: string;
  epsGrowth5yPct: string;
  debtToEquity: string;
  profitMarginPct: string;
  dividendYieldPct: string;
  esgScore: string;
  beta: string;
}

export interface ScoringWeights {
  pe: number;
  epsGrowth5yPct: number;
  debtToEquity: number;
  profitMarginPct: number;
  dividendYieldPct: number;
  esgScore: number;
  beta: number;
}

export interface SubscoreResults {
  pe: number;
  eps: number;
  d2e: number;
  pm: number;
  div: number;
  esg: number;
  bet: number;
}

export interface VerdictResult {
  label: string;
  color: string;
}

export interface FetchedMetrics {
  pe: number;
  epsGrowth5yPct: number;
  debtToEquity: number;
  profitMarginPct: number;
  dividendYieldPct: number;
  esgScore: number;
  beta: number;
}

export type DataProvider = "alphaVantage" | "demo";