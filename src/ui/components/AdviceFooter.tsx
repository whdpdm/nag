import type { AdviceFooterProps } from '../../types/uiComponents.js';

export function AdviceFooter({ text }: AdviceFooterProps) {
  return (
    <footer className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <p className="text-xs font-semibold text-amber-800">💬 사수의 조언</p>
      <p className="mt-2 text-sm leading-relaxed text-amber-900">{text}</p>
    </footer>
  );
}
