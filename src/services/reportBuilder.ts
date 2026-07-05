import { NAG_PERSONALITY_TYPES } from '../prompts/nagTemplates.js';
import type { CommitAnalysisStats } from '../types/analysisStats.js';
import type { CommitRecord } from '../types/commitRecord.js';
import type {
  NagAnalysisResult,
  NagDashboardReport,
  NagDashboardViewModel,
  NagReportMeta,
  PersonalityTheme,
  StatCardProps,
} from '../types/uiComponents.js';

const PERSONALITY_THEMES: Record<1 | 2 | 3 | 4 | 5, PersonalityTheme> = {
  1: { accent: '#e74c3c', badge: '🔥' },
  2: { accent: '#9b59b6', badge: '🔬' },
  3: { accent: '#f39c12', badge: '📓' },
  4: { accent: '#c0392b', badge: '📦' },
  5: { accent: '#95a5a6', badge: '🤖' },
};

function pct(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

function formatKst(isoDate: string): string {
  const kst = new Date(new Date(isoDate).getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().replace('T', ' ').slice(0, 16);
}

function formatDateRange(stats: CommitAnalysisStats): string {
  const first = formatKst(stats.date_range.first).slice(0, 10);
  const last = formatKst(stats.date_range.last).slice(0, 10);
  return `${first} ~ ${last}`;
}

function buildStatCards(stats: CommitAnalysisStats): StatCardProps[] {
  return [
    {
      label: '새벽 커밋 비율',
      value: pct(stats.dawn_commit_ratio),
      tone: stats.dawn_commit_ratio >= 0.3 ? 'danger' : 'neutral',
    },
    {
      label: '무성의 메시지',
      value: pct(stats.message.lazy_message_ratio),
      tone: stats.message.lazy_message_ratio >= 0.2 ? 'warning' : 'neutral',
    },
    {
      label: '평균 메시지 길이',
      value: `${stats.message.avg_length}자`,
      tone: 'neutral',
    },
    {
      label: '5분 이내 연속',
      value: `${stats.timing.burst_commit_count}회`,
      tone: stats.timing.burst_commit_count >= 3 ? 'warning' : 'neutral',
    },
    {
      label: '최대 추가 줄',
      value: `${stats.stats.max_additions}줄`,
      tone: stats.stats.max_additions >= 500 ? 'danger' : 'neutral',
    },
    {
      label: '폭탄 커밋',
      value: `${stats.stats.bomb_commit_count}건`,
      tone: stats.stats.bomb_commit_count >= 1 ? 'danger' : 'neutral',
    },
  ];
}

function resolveSecondaryLabel(
  secondaryId: 1 | 2 | 3 | 4 | 5 | null,
): string | null {
  if (secondaryId === null) return null;
  return (
    NAG_PERSONALITY_TYPES.find((t) => t.id === secondaryId)?.label ?? null
  );
}

export function buildDashboardViewModel(
  meta: NagReportMeta,
  stats: CommitAnalysisStats,
  analysis: NagAnalysisResult,
  commits: CommitRecord[],
): NagDashboardViewModel {
  const theme = PERSONALITY_THEMES[analysis.type_id];

  return {
    header: {
      repo: meta.repo,
      analyzedAt: meta.analyzed_at,
      commitCount: meta.commit_count,
      dateRangeLabel: formatDateRange(stats),
    },
    personality: {
      typeId: analysis.type_id,
      typeLabel: analysis.type_label,
      confidence: analysis.confidence,
      secondaryTypeLabel: resolveSecondaryLabel(analysis.secondary_type_id),
      theme,
    },
    punchline: analysis.summary_punchline,
    nagBubbles: analysis.nag_list.map((text, index) => ({ index, text })),
    statCards: buildStatCards(stats),
    evidence: { items: analysis.evidence },
    advice: { text: analysis.advice },
    commitTimeline: commits.map((c) => ({
      sha: c.sha,
      dateLabel: formatKst(c.date),
      author: c.author,
      message: c.message,
      additions: c.stats.additions,
      deletions: c.stats.deletions,
      filesChanged: c.stats.files_changed,
    })),
  };
}

export function buildDashboardReport(
  meta: NagReportMeta,
  stats: CommitAnalysisStats,
  analysis: NagAnalysisResult,
  commits: CommitRecord[],
): NagDashboardReport {
  return {
    meta,
    analysis,
    stats,
    commits,
    view: buildDashboardViewModel(meta, stats, analysis, commits),
  };
}
