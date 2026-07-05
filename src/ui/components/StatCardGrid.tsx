import type { StatCardProps } from '../../types/uiComponents.js';

const TONE_CLASS: Record<StatCardProps['tone'], string> = {
  neutral: 'border-gray-200 text-gray-900',
  warning: 'border-amber-300 text-amber-700',
  danger: 'border-red-300 text-red-700',
};

export function StatCardGrid({ cards }: { cards: StatCardProps[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-lg border bg-white p-4 ${TONE_CLASS[card.tone]}`}
        >
          <p className="text-xs text-gray-500">{card.label}</p>
          <p className="mt-1 text-xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
