import type { ReportHeaderProps } from '../../types/uiComponents.js';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ReportHeader({
  repo,
  analyzedAt,
  commitCount,
  dateRangeLabel,
}: ReportHeaderProps) {
  return (
    <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">개발 성향 팩트 폭행 보고서</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">{repo}</h1>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
        <div>
          <dt className="text-gray-400">분석 시각</dt>
          <dd>{formatDate(analyzedAt)}</dd>
        </div>
        <div>
          <dt className="text-gray-400">커밋 수</dt>
          <dd>{commitCount}개</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-gray-400">분석 기간</dt>
          <dd>{dateRangeLabel}</dd>
        </div>
      </dl>
    </header>
  );
}
