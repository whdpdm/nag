import type { NagBubbleProps } from '../../types/uiComponents.js';

export function NagBubbleList({ items }: { items: NagBubbleProps[] }) {
  return (
    <div className="space-y-3">
      {items.map((bubble) => (
        <div
          key={bubble.index}
          className="relative rounded-2xl rounded-tl-sm bg-white p-4 shadow-sm ring-1 ring-red-100"
        >
          <p className="text-sm leading-relaxed text-gray-800">{bubble.text}</p>
        </div>
      ))}
    </div>
  );
}
