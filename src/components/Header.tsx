import React from 'react';

interface HeaderProps {
  manual: boolean;
  setManual: (value: boolean) => void;
  provider: 'alphaVantage' | 'demo';
  setProvider: (value: 'alphaVantage' | 'demo') => void;
}

export function Header({ manual, setManual, provider, setProvider }: HeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">MTWB Stock Scorer</h1>
        <p className="text-sm text-gray-600">
          Case-study aligned scoring for Connor Barwin / Make the World Better (grow $500k → $1.5M in 10 years, sustain $10k annual drawdowns, ESG-forward).
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={manual}
            onChange={(e) => setManual(e.target.checked)}
          />
          Manual Entry Mode
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span>Data Source:</span>
          <select
            className="rounded-xl border px-2 py-1"
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'alphaVantage' | 'demo')}
          >
            <option value="alphaVantage">Alpha Vantage</option>
            <option value="demo">Demo</option>
          </select>
        </label>
      </div>
    </header>
  );
}