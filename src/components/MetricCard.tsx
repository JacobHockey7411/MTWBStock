import React from 'react';

interface MetricCardProps {
  name: string;
  value: string;
  sub: number;
  hint?: string;
}

export function MetricCard({ name, value, sub, hint }: MetricCardProps) {
  return (
    <div className="rounded-2xl border p-3">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-sm text-gray-500">{name}</div>
          <div className="text-xl font-semibold">{value || "—"}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Subscore</div>
          <div className="text-xl font-semibold">{isNaN(sub) ? "0" : Math.round(sub)}</div>
        </div>
      </div>
      {hint && <div className="mt-2 text-xs text-gray-500">{hint}</div>}
    </div>
  );
}