import type { CommitAnalysisStats } from '../types/analysisStats.js';
import type { CommitRecord } from '../types/commitRecord.js';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const LAZY_MESSAGE_PATTERN = /^(fix|wip|update|test|\.|\.+|ㅇㅇ|asdf|temp)$/i;
const CONVENTIONAL_PATTERN =
  /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\([^)]+\))?!?:\s+.+/i;

function getKstHour(isoDate: string): number {
  const kstMs = new Date(isoDate).getTime() + KST_OFFSET_MS;
  return new Date(kstMs).getUTCHours();
}

function getKstWeekday(isoDate: string): number {
  const kstMs = new Date(isoDate).getTime() + KST_OFFSET_MS;
  return new Date(kstMs).getUTCDay();
}

function isDawnHour(hour: number): boolean {
  return hour >= 0 && hour <= 5;
}

function isLateNightHour(hour: number): boolean {
  return hour >= 22 || hour <= 5;
}

function isWeekday(weekday: number): boolean {
  return weekday >= 1 && weekday <= 5;
}

function isLazyMessage(message: string): boolean {
  const trimmed = message.trim();
  return trimmed.length <= 3 || LAZY_MESSAGE_PATTERN.test(trimmed);
}

function isDiaryStyleMessage(message: string): boolean {
  return message.trim().length >= 40;
}

function isConventionalMessage(message: string): boolean {
  return CONVENTIONAL_PATTERN.test(message.trim());
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function ratio(count: number, total: number): number {
  if (total === 0) return 0;
  return round(count / total);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function computeGapsMinutes(sortedAsc: CommitRecord[]): number[] {
  const gaps: number[] = [];
  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = new Date(sortedAsc[i - 1].date).getTime();
    const curr = new Date(sortedAsc[i].date).getTime();
    gaps.push((curr - prev) / (1000 * 60));
  }
  return gaps;
}

/**
 * CommitRecord[]에서 LLM 프롬프트용 정적 통계를 추출합니다.
 */
export function analyzeCommits(commits: CommitRecord[]): CommitAnalysisStats {
  if (commits.length === 0) {
    throw new Error('분석할 커밋이 없습니다.');
  }

  const sortedAsc = [...commits].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const dates = sortedAsc.map((c) => c.date);
  const firstDate = new Date(dates[0]).getTime();
  const lastDate = new Date(dates[dates.length - 1]).getTime();
  const spanHours = round((lastDate - firstDate) / (1000 * 60 * 60));

  let dawnCount = 0;
  let lateNightCount = 0;
  let weekdayCount = 0;

  for (const commit of commits) {
    const hour = getKstHour(commit.date);
    const weekday = getKstWeekday(commit.date);
    if (isDawnHour(hour)) dawnCount++;
    if (isLateNightHour(hour)) lateNightCount++;
    if (isWeekday(weekday)) weekdayCount++;
  }

  const messageLengths = commits.map((c) => c.message.trim().length);
  const lazyCount = commits.filter((c) => isLazyMessage(c.message)).length;
  const diaryCount = commits.filter((c) => isDiaryStyleMessage(c.message)).length;
  const conventionalCount = commits.filter((c) =>
    isConventionalMessage(c.message),
  ).length;

  const gaps = computeGapsMinutes(sortedAsc);
  const burstCount = gaps.filter((gap) => gap <= 5).length;

  const additions = commits.map((c) => c.stats.additions);
  const deletions = commits.map((c) => c.stats.deletions);
  const filesChanged = commits.map((c) => c.stats.files_changed);

  const bombCount = commits.filter(
    (c) => c.stats.additions >= 500 || c.stats.files_changed >= 20,
  ).length;

  const microCount = commits.filter(
    (c) =>
      c.stats.additions + c.stats.deletions <= 20 &&
      c.stats.files_changed <= 2,
  ).length;

  const authorNames = [...new Set(commits.map((c) => c.author))];

  return {
    total_commits: commits.length,
    date_range: {
      first: dates[0],
      last: dates[dates.length - 1],
      span_hours: spanHours,
    },
    dawn_commit_ratio: ratio(dawnCount, commits.length),
    late_night_commit_ratio: ratio(lateNightCount, commits.length),
    weekday_commit_ratio: ratio(weekdayCount, commits.length),
    message: {
      avg_length: round(average(messageLengths)),
      max_length: Math.max(...messageLengths),
      min_length: Math.min(...messageLengths),
      lazy_message_ratio: ratio(lazyCount, commits.length),
      diary_style_ratio: ratio(diaryCount, commits.length),
      conventional_ratio: ratio(conventionalCount, commits.length),
      samples: commits.slice(0, 8).map((c) => c.message),
    },
    timing: {
      avg_gap_minutes: average(gaps),
      min_gap_minutes: gaps.length > 0 ? round(Math.min(...gaps)) : 0,
      burst_commit_count: burstCount,
    },
    stats: {
      avg_additions: average(additions),
      max_additions: Math.max(...additions),
      total_additions: additions.reduce((sum, v) => sum + v, 0),
      avg_deletions: average(deletions),
      max_deletions: Math.max(...deletions),
      avg_files_changed: average(filesChanged),
      max_files_changed: Math.max(...filesChanged),
      bomb_commit_count: bombCount,
      micro_commit_count: microCount,
    },
    authors: {
      unique_count: authorNames.length,
      names: authorNames,
    },
  };
}
