import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { analyzeCommits } from '../src/services/analyzerService.js';
import {
  buildNagPromptBundle,
  formatPromptForDisplay,
} from '../src/prompts/nagTemplates.js';
import type { CommitRecord } from '../src/types/commitRecord.js';

const DEFAULT_INPUT = 'commits-output.json';

function loadCommits(filePath: string): CommitRecord[] {
  const raw = readFileSync(filePath, 'utf-8');
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(`${filePath}: 커밋 배열이 비어 있거나 형식이 올바르지 않습니다.`);
  }

  return parsed as CommitRecord[];
}

const inputPath = resolve(process.argv[2] ?? DEFAULT_INPUT);

try {
  const commits = loadCommits(inputPath);
  const stats = analyzeCommits(commits);
  const bundle = buildNagPromptBundle(stats, commits);

  console.log(formatPromptForDisplay(bundle));

  console.error('\n--- 추출된 통계 요약 ---');
  console.error(`커밋 수: ${stats.total_commits}`);
  console.error(`새벽 커밋 비율: ${(stats.dawn_commit_ratio * 100).toFixed(0)}%`);
  console.error(`무성의 메시지 비율: ${(stats.message.lazy_message_ratio * 100).toFixed(0)}%`);
  console.error(`평균 메시지 길이: ${stats.message.avg_length}자`);
  console.error(`최대 additions: ${stats.stats.max_additions}`);
  console.error(`5분 이내 연속 커밋: ${stats.timing.burst_commit_count}회`);
  console.error(`\n✓ 프롬프트 생성 완료 (입력: ${inputPath})`);
} catch (error) {
  console.error(
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
}
