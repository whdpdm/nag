import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { analyzeCommits } from '../src/services/analyzerService.js';
import { buildDashboardReport } from '../src/services/reportBuilder.js';
import { generateMockAnalysis } from '../src/services/mockReportService.js';
import { generateRandomDashboardReport } from '../src/services/randomMockDataService.js';
import { DASHBOARD_LAYOUT } from '../src/ui/dashboardLayout.js';
import { COMPONENT_REGISTRY } from '../src/ui/componentRegistry.js';
import type { CommitRecord } from '../src/types/commitRecord.js';

const COMMITS_FILE = 'commits-output.json';
const OUTPUT_FILE = 'mock-report-output.json';
const DEFAULT_REPO = 'unknown/repo';

function loadCommits(filePath: string): CommitRecord[] {
  const raw = readFileSync(filePath, 'utf-8');
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(`${filePath}: 커밋 배열이 비어 있거나 형식이 올바르지 않습니다.`);
  }

  return parsed as CommitRecord[];
}

function parseArgs(): {
  mode: 'random' | 'file';
  commitsPath: string;
  repo: string;
} {
  const args = process.argv.slice(2);
  let mode: 'random' | 'file' = 'random';
  let commitsPath = resolve(COMMITS_FILE);
  let repo = DEFAULT_REPO;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from-file') {
      mode = 'file';
      if (args[i + 1] && !args[i + 1].startsWith('--')) {
        commitsPath = resolve(args[++i]);
      }
    } else if (!args[i].startsWith('--')) {
      repo = args[i];
    }
  }

  return { mode, commitsPath, repo };
}

const { mode, commitsPath, repo } = parseArgs();

try {
  const report =
    mode === 'random'
      ? generateRandomDashboardReport(repo === DEFAULT_REPO ? undefined : repo)
      : (() => {
          const commits = loadCommits(commitsPath);
          const stats = analyzeCommits(commits);
          const analysis = generateMockAnalysis(stats, commits);

          return buildDashboardReport(
            {
              repo,
              analyzed_at: new Date().toISOString(),
              commit_count: commits.length,
            },
            stats,
            analysis,
            commits,
          );
        })();

  writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));

  console.log(`✓ ${OUTPUT_FILE} 생성 완료 (${mode === 'random' ? '무작위' : '파일 기반'})`);
  console.log(`  레포: ${report.meta.repo}`);
  console.log(`  커밋: ${report.meta.commit_count}개`);
  console.log(`  성향: ${report.analysis.type_label} (${report.analysis.confidence}%)`);
  console.log(`  한 줄: ${report.analysis.summary_punchline}`);
  console.log(`  잔소리: ${report.analysis.nag_list.length}개`);
  console.log('');
  console.log('--- UI 컴포넌트 레지스트리 ---');
  for (const c of COMPONENT_REGISTRY) {
    console.log(`  ${c.id} → ${c.targetPath}`);
  }
  console.log('');
  console.log('--- 대시보드 레이아웃 ---');
  for (const section of DASHBOARD_LAYOUT) {
    const slots = section.components.map((c) => c.componentId).join(', ');
    console.log(`  [${section.sectionId}] ${section.title}: ${slots}`);
  }

  if (mode === 'random') {
    console.log('');
    console.log('💡 실제 커밋 파일 기반: npm run generate-mock-report -- --from-file commits-output.json owner/repo');
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
