// Utility functions for scoring calculations
export const clamp = (x: number, a: number, b: number): number => 
  Math.max(a, Math.min(b, x));

export const num = (v: string): number => 
  (v === "" || v === null || v === undefined ? NaN : Number(v));

// Scoring functions: return 0–100
export const scorePE = (pe?: number): number => {
  if (pe === undefined || isNaN(pe) || pe <= 0) return 0;
  const target = 20; // center
  const tol = 20; // tolerance width
  const dist = Math.abs(pe - target);
  const base = clamp(100 - (dist / tol) * 100, 0, 100);
  const bonus = pe >= 12 && pe <= 28 ? 5 : 0; // slight bonus if 12–28
  return clamp(base + bonus, 0, 100);
};

export const scoreEPSGrowth = (g?: number): number => {
  // g in % CAGR over 5y. 0% -> 30, 10% -> 60, 20% -> 85, 30%+ -> 100. Negative -> 0.
  if (g === undefined || isNaN(g)) return 0;
  if (g <= 0) return 0;
  if (g >= 30) return 100;
  return clamp(30 + (g / 30) * 70, 0, 100);
};

export const scoreD2E = (d?: number): number => {
  // Lower is better; <=0.3 -> 100, >=3.0 -> 0
  if (d === undefined || isNaN(d) || d < 0) return 0;
  if (d <= 0.3) return 100;
  if (d >= 3) return 0;
  return clamp(100 - ((d - 0.3) / (3 - 0.3)) * 100, 0, 100);
};

export const scoreMargin = (m?: number): number => {
  // m in %; 30%+ -> 100
  if (m === undefined || isNaN(m)) return 0;
  if (m <= 0) return 0;
  if (m >= 30) return 100;
  return clamp((m / 30) * 100, 0, 100);
};

export const scoreDividend = (y?: number): number => {
  // Prefer sustainable 1–4% yield; peak ~2.5%
  if (y === undefined || isNaN(y) || y < 0) return 0;
  if (y === 0) return 40; // growth companies can still be fine for MTWB goals
  if (y > 12) return 0;
  const peak = 2.5;
  const spread = 2.0; // tolerance
  const z = (y - peak) / spread;
  const base = 100 * Math.exp(-0.5 * z * z);
  return clamp(base, 10, 100);
};

export const scoreESG = (e?: number): number => {
  if (e === undefined || isNaN(e) || e < 0) return 0;
  return clamp(e, 0, 100);
};

export const scoreBeta = (b?: number): number => {
  // Stability matters for yearly drawdowns. Best ~0.8–1.1.
  if (b === undefined || isNaN(b) || b <= 0) return 0;
  const peak = 0.95;
  const tol = 0.35; // 0.6–1.3 reasonable
  const dist = Math.abs(b - peak);
  let base = clamp(100 - (dist / tol) * 100, 0, 100);
  if (b > 1.5) base = Math.min(base, 35);
  return base;
};