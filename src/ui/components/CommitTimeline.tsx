import type { CommitTimelineItemProps } from '../../types/uiComponents.js';

export function CommitTimeline({ items }: { items: CommitTimelineItemProps[] }) {
  return (
    <ol className="relative space-y-4 border-l-2 border-gray-200 pl-6">
      {items.map((item) => (
        <li key={item.sha} className="relative">
          <span className="absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full bg-gray-400" />
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono">
                {item.sha}
              </code>
              <span>{item.dateLabel}</span>
              <span>· {item.author}</span>
            </div>
            <p className="mt-2 font-medium text-gray-900">{item.message}</p>
            <p className="mt-1 text-xs text-gray-400">
              +{item.additions} / -{item.deletions} · {item.filesChanged}개 파일
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
