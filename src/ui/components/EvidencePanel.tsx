import type { EvidencePanelProps } from '../../types/uiComponents.js';

export function EvidencePanel({ items }: EvidencePanelProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        판단 근거
      </h3>
      <ul className="space-y-2 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-slate-400">▸</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
