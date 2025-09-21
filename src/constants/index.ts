import { ScoringWeights } from '../types';

// Default MTWB-aligned weights (sum to 100)
export const DEFAULT_WEIGHTS: ScoringWeights = {
  pe: 15,
  epsGrowth5yPct: 20,
  debtToEquity: 15,
  profitMarginPct: 10,
  dividendYieldPct: 10,
  esgScore: 20,
  beta: 10,
};

export const ALPHA_VANTAGE_API_KEY = "JJNHRP0DOHOT7IYZ";
export const OPENAI_API_KEY = "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";

export const DEMO_DATA: Record<string, any> = {
  AAPL: {
    pe: 30.2,
    epsGrowth5yPct: 18.5,
    debtToEquity: 1.6,
    profitMarginPct: 26.1,
    dividendYieldPct: 0.6,
    esgScore: 76,
    beta: 1.12,
  },
  NEE: {
    pe: 22.4,
    epsGrowth5yPct: 10.2,
    debtToEquity: 1.3,
    profitMarginPct: 19.4,
    dividendYieldPct: 3.1,
    esgScore: 84,
    beta: 0.92,
  },
  JNJ: {
    pe: 17.9,
    epsGrowth5yPct: 5.4,
    debtToEquity: 0.5,
    profitMarginPct: 36.7,
    dividendYieldPct: 3.3,
    esgScore: 78,
    beta: 0.6,
  },
};