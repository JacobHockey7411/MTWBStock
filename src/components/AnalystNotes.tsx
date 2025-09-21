import React from 'react';
import { StockMetrics, SubscoreResults, VerdictResult } from '../types';

interface AnalystNotesProps {
  ticker: string;
  metrics: StockMetrics;
  subscores: SubscoreResults;
  weightedScore: number;
  verdict: VerdictResult;
}

export function AnalystNotes({ ticker, metrics, subscores, weightedScore, verdict }: AnalystNotesProps) {
  const notesText = `
Ticker: ${ticker || "(enter)"}
Overall Score: ${weightedScore} — ${verdict.label}

Why it fits MTWB:
- Long-horizon growth to help reach $1.5M in 10 years
- Supports $10k/yr drawdowns starting 2029 via stability/dividends
- ESG alignment with community-first, sustainability-minded values

Key Metrics:
- P/E: ${metrics.pe || "?"}  | Subscore: ${subscores.pe}
- EPS 5y %: ${metrics.epsGrowth5yPct || "?"}  | Subscore: ${subscores.eps}
- Debt/Equity: ${metrics.debtToEquity || "?"}  | Subscore: ${subscores.d2e}
- Profit Margin %: ${metrics.profitMarginPct || "?"}  | Subscore: ${subscores.pm}
- Dividend Yield %: ${metrics.dividendYieldPct || "?"}  | Subscore: ${subscores.div}
- ESG Score: ${metrics.esgScore || "?"}  | Subscore: ${subscores.esg}
- Beta: ${metrics.beta || "?"}  | Subscore: ${subscores.bet}

Next Steps:
- Compare against 2–3 peers; confirm valuation vs. sector median
- Read latest 10-K/earnings call for qualitative risks
- Validate ESG score from at least two sources
`;

  return (
    <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Analyst Notes (copy for your WInS journal)</h2>
      <pre className="whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-sm text-gray-800">
        {notesText}
      </pre>
    </section>
  );
}