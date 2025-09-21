import React from 'react';

interface TickerInputProps {
  ticker: string;
  setTicker: (value: string) => void;
  loading: boolean;
  manual: boolean;
  provider: 'alphaVantage' | 'demo';
  onFetch: () => void;
}

export function TickerInput({
  ticker,
  setTicker,
  loading,
  manual,
  provider,
  onFetch,
}: TickerInputProps) {
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
    <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-2">
      <div>
        <Field
          label="Ticker"
          value={ticker}
          onChange={setTicker}
          placeholder="e.g., AAPL, NEE, JNJ"
        />
      </div>
      <div className="flex items-end">
        <button
          onClick={onFetch}
          disabled={!ticker || loading || manual}
          className="w-full rounded-2xl bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Fetching…" : provider === "demo" ? "Load Demo Data" : "Fetch Real Data"}
        </button>
      </div>
    </section>
  );
}