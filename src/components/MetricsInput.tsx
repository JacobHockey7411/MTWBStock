import React from 'react';
import { StockMetrics, ScoringWeights } from '../types';

interface MetricsInputProps {
  metrics: StockMetrics;
  setMetrics: (metrics: StockMetrics) => void;
  weights: ScoringWeights;
  setWeights: (weights: ScoringWeights) => void;
  totalWeight: number;
}

export function MetricsInput({ metrics, setMetrics, weights, setWeights, totalWeight }: MetricsInputProps) {
  const Field = ({ label, value, onChange, placeholder }: any) => (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <input
        className="mt-1 w-full rounded-2xl border bg-white/70 px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-emerald-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );

  return (
    <section className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Key Metrics</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field 
            label="P/E" 
            value={metrics.pe} 
            onChange={(v: string) => setMetrics({ ...metrics, pe: v })} 
            placeholder="e.g., 22.4" 
          />
          <Field 
            label="EPS Growth 5y %" 
            value={metrics.epsGrowth5yPct} 
            onChange={(v: string) => setMetrics({ ...metrics, epsGrowth5yPct: v })} 
            placeholder="e.g., 12.5" 
          />
          <Field 
            label="Debt / Equity" 
            value={metrics.debtToEquity} 
            onChange={(v: string) => setMetrics({ ...metrics, debtToEquity: v })} 
            placeholder="e.g., 0.8" 
          />
          <Field 
            label="Profit Margin %" 
            value={metrics.profitMarginPct} 
            onChange={(v: string) => setMetrics({ ...metrics, profitMarginPct: v })} 
            placeholder="e.g., 18.0" 
          />
          <Field 
            label="Dividend Yield %" 
            value={metrics.dividendYieldPct} 
            onChange={(v: string) => setMetrics({ ...metrics, dividendYieldPct: v })} 
            placeholder="e.g., 2.4" 
          />
          <Field 
            label="ESG Score (0–100)" 
            value={metrics.esgScore} 
            onChange={(v: string) => setMetrics({ ...metrics, esgScore: v })} 
            placeholder="e.g., 80" 
          />
          <Field 
            label="Beta" 
            value={metrics.beta} 
            onChange={(v: string) => setMetrics({ ...metrics, beta: v })} 
            placeholder="e.g., 0.95" 
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Tip: Data is automatically fetched from Alpha Vantage and enhanced with OpenAI for missing metrics like ESG scores. For MTWB, prefer ESG ≥ 70 and avoid excessive leverage or volatility.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Weights (MTWB Defaults)</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(weights).map(([k, v]) => (
            <label key={k} className="block">
              <span className="text-sm capitalize text-gray-600">{k}</span>
              <input
                type="number"
                className="mt-1 w-full rounded-2xl border bg-white/70 px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-emerald-400"
                value={v}
                onChange={(e) => setWeights({ ...weights, [k]: Number(e.target.value) })}
              />
            </label>
          ))}
        </div>
        <div className="mt-3 text-sm text-gray-700">
          Total Weight: <span className="font-semibold">{totalWeight}</span> (should be 100)
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Defaults emphasize ESG (20), sustainable growth (EPS 20), reasonable valuation (P/E 15), balance-sheet strength (D/E 15), stability (Beta 10), quality margins (10), and cash support for drawdowns via dividends (10).
        </p>
      </div>
    </section>
  );
}