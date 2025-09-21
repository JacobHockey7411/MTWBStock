import React from 'react';
import { MetricCard } from './MetricCard';
import { StockMetrics, SubscoreResults, VerdictResult } from '../types';

interface ResultsProps {
  error: string | null;
  metrics: StockMetrics;
  subscores: SubscoreResults;
  weightedScore: number;
  verdict: VerdictResult;
}

export function Results({ error, metrics, subscores, weightedScore, verdict }: ResultsProps) {
  return (
    <section className="mt-6 grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl bg-white p-4 shadow-sm md:col-span-2">
        <h2 className="mb-3 text-lg font-semibold">Results</h2>
        {error && (
          <div className="mb-3 rounded-xl bg-rose-50 p-3 text-rose-700">{error}</div>
        )}
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard name="P/E" value={metrics.pe} sub={subscores.pe} hint="Target 15–25 for reasonably priced growth." />
          <MetricCard name="EPS 5y %" value={metrics.epsGrowth5yPct} sub={subscores.eps} hint=", 20–30% is excellent." />
          <MetricCard name="Debt/Equity" value={metrics.debtToEquity} sub={subscores.d2e} hint="Prefer ≤1.0; avoid >2.0." />
          <MetricCard name="Profit Margin %" value={metrics.profitMarginPct} sub={subscores.pm} hint="Higher is better; 20%+ strong." />
          <MetricCard name="Dividend Yield %" value={metrics.dividendYieldPct} sub={subscores.div} hint="Sweet spot 1–4% for sustainability." />
          <MetricCard name="ESG Score" value={metrics.esgScore} sub={subscores.esg} hint="MTWB prefers ≥70." />
          <MetricCard name="Beta" value={metrics.beta} sub={subscores.bet} hint="Aim 0.8–1.1 for stability." />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Suitability</h2>
        <div className="rounded-2xl border p-4 text-center">
          <div className={`mx-auto mb-2 h-2 w-32 rounded-full ${verdict.color}`}></div>
          <div className="text-3xl font-bold">{weightedScore}</div>
          <div className="mt-1 text-sm text-gray-600">/ 100 total</div>
          <div className="mt-2 text-base font-medium">{verdict.label}</div>
        </div>
        <p className="mt-3 text-xs text-gray-600">
          Legend: <span className="font-medium">Strong ≥ 80</span>, <span className="font-medium">Moderate 65–79</span>, <span className="font-medium">Avoid &lt; 65</span>
        </p>
      </div>
    </section>
  );
}