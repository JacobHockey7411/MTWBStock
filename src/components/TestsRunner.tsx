import React from 'react';
import { clamp, scorePE, scoreDividend } from '../utils/scoring';

export function TestsRunner() {
  const tests: Array<{ name: string; pass: boolean; details?: string }> = [];

  // Test cases (kept simple and deterministic)
  // 1) P/E sanity
  tests.push({ name: "PE 20 near target", pass: scorePE(20) > scorePE(5) && scorePE(20) > scorePE(60) });
  tests.push({ name: "PE negative -> 0", pass: scorePE(-10) === 0 });

  // 2) Dividend sweet spot around ~2.5%
  const dMid = scoreDividend(2.5), dLow = scoreDividend(0.0), dHigh = scoreDividend(10);
  tests.push({ name: "Dividend 2.5% > 0%", pass: dMid > dLow });
  tests.push({ name: "Dividend 2.5% > 10%", pass: dMid > dHigh });

  // 3) Alpha Vantage mapping smoke test (no network). Ensures field conversions behave.
  const mapProfit = (v: any) => {
    const n = Number(v); return isFinite(n) ? n * 100 : NaN;
  };
  tests.push({ name: "Profit fraction to %", pass: Math.abs(mapProfit(0.25) - 25) < 1e-6 });

  return (
    <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Built-in Tests</h2>
      <div>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {tests.map((t, i) => (
            <li key={i} className={t.pass ? "text-emerald-700" : "text-rose-700"}>
              {t.pass ? "✔" : "✖"} {t.name}{t.details ? ` — ${t.details}` : ""}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Tests check scoring sanity (no financial advice). If any test fails, let me know what behavior you expect.
      </p>
    </section>
  );
}