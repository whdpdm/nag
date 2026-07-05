import type { CommitAnalysisStats } from '../types/analysisStats.js';
import type { CommitRecord } from '../types/commitRecord.js';
import type { NagDashboardReport } from '../types/uiComponents.js';
import { analyzeCommits } from './analyzerService.js';
import { generateMockAnalysis } from './mockReportService.js';
import { buildDashboardReport } from './reportBuilder.js';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomPick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function randomSha(): string {
  return randomInt(0, 0xfffffff).toString(16).padStart(7, '0');
}

function toIso(date: Date): string {
  return date.toISOString();
}

const AUTHORS = [
  'Sophie',
  'dev_sophie',
  '김개발',
  'user_sophie',
  'sophie_engineer',
  'The Octocat',
  '야근러',
  '주니어_dev',
];

const LAZY_MESSAGES = ['fix', '.', 'wip', 'update', 'temp', 'ㅇㅇ', 'asdf'];

const DIARY_MESSAGES = [
  'feat: 오늘 점심 초밥 먹고 코딩 잘됨. 프롬프트 설계 완료',
  'chore: 동아리 회의 가야 돼서 일단 여기까지 대충 올림',
  'fix: 아까 밥 먹고 한 거 다 날아가서 빡친 상태로 다시 짬',
  'feat: 밤샘 시작… 커피 세 잔째. 살려줘',
  'docs: README 오타 수정했는데 또 틀린 것 같아서 다시 수정',
];

const CONVENTIONAL_MESSAGES = [
  'feat: update code',
  'fix: modify something',
  'refactor: clean build',
  'test: add test',
  'docs: update readme',
  'style: fix lint',
];

const NORMAL_MESSAGES = [
  'feat: GitHub API 연동 기초 틀 작업',
  'fix: 로그인 리다이렉트 버그 수정',
  'refactor: analyzerService 모듈 분리',
  'chore: 의존성 버전 업데이트',
  'fix: 타입 에러 수정',
];

const BOMB_MESSAGES = [
  'refactor: 패키지 이것저것 다 깔아봄',
  'fix: API 라이브러리 통째로 복사해옴',
  'chore: 보일러플레이트 대량 추가',
];

/** UI 스트레스 테스트용 무작위 커밋 배열 생성 */
export function generateRandomCommits(): CommitRecord[] {
  const count = randomInt(5, 28);
  const spanDays = randomInt(3, 120);
  const endTime = Date.now() - randomInt(0, 2) * 24 * 60 * 60 * 1000;
  const startTime = endTime - spanDays * 24 * 60 * 60 * 1000;

  const commits: CommitRecord[] = [];
  const messageRoll = randomFloat(0, 1);

  for (let i = 0; i < count; i++) {
    const timestamp = randomInt(startTime, endTime);
    const date = new Date(timestamp);

    // 새벽 KST(0~5시) 비율을 높일지 랜덤 결정
    if (Math.random() < 0.35) {
      const kstHour = randomInt(0, 5);
      const utcHour = (kstHour - 9 + 24) % 24;
      date.setUTCHours(utcHour, randomInt(0, 59), randomInt(0, 59));
    } else if (Math.random() < 0.2) {
      date.setUTCHours(randomInt(22, 23), randomInt(0, 59), 0);
    }

    let message: string;
    let additions: number;
    let deletions: number;
    let filesChanged: number;

    if (messageRoll < 0.2) {
      message = randomPick(LAZY_MESSAGES);
      additions = randomInt(1, 15);
      deletions = randomInt(0, 10);
      filesChanged = 1;
    } else if (messageRoll < 0.4) {
      message = randomPick(DIARY_MESSAGES);
      additions = randomInt(20, 400);
      deletions = randomInt(0, 100);
      filesChanged = randomInt(1, 8);
    } else if (messageRoll < 0.55) {
      message = randomPick(BOMB_MESSAGES);
      additions = randomInt(500, 6000);
      deletions = randomInt(0, 2000);
      filesChanged = randomInt(8, 45);
    } else if (messageRoll < 0.7) {
      message = randomPick(CONVENTIONAL_MESSAGES);
      additions = randomInt(5, 120);
      deletions = randomInt(0, 80);
      filesChanged = randomInt(1, 4);
    } else {
      message = randomPick(NORMAL_MESSAGES);
      additions = randomInt(10, 350);
      deletions = randomInt(0, 200);
      filesChanged = randomInt(1, 12);
    }

    // 완벽주의형: 미세 커밋
    if (Math.random() < 0.25) {
      additions = randomInt(1, 3);
      deletions = randomInt(0, 2);
      filesChanged = 1;
      message = randomPick([
        'docs: README 오타 수정',
        'style: 세미콜론 추가',
        'fix: 변수명 오타',
        'docs: 마침표 빠트려서 다시 수정',
      ]);
    }

    commits.push({
      sha: randomSha(),
      author: randomPick(AUTHORS),
      date: toIso(date),
      message,
      stats: { additions, deletions, files_changed: filesChanged },
    });
  }

  // burst cluster: 5분 이내 연속 커밋 묶음
  if (Math.random() < 0.6 && commits.length >= 4) {
    const clusterSize = randomInt(3, 6);
    const base = randomPick(commits).date;
    const baseTime = new Date(base).getTime();
    for (let j = 0; j < clusterSize && j < commits.length; j++) {
      commits[j].date = toIso(new Date(baseTime + j * randomInt(1, 4) * 60 * 1000));
      commits[j].stats = {
        additions: randomInt(1, 2),
        deletions: randomInt(0, 1),
        files_changed: 1,
      };
    }
  }

  return commits.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

const REPO_NAMES = [
  'sophie/ai-nag',
  'dev-team/backend-api',
  'choyeeun/portfolio',
  'octocat/Hello-World',
  'side-project/midnight-coder',
  'club/hackathon-2026',
];

/** 무작위 커밋 + 통계 + AI mock → 완전한 대시보드 리포트 */
export function generateRandomDashboardReport(
  repo?: string,
): NagDashboardReport {
  const commits = generateRandomCommits();
  const stats = analyzeCommits(commits);
  const analysis = generateMockAnalysis(stats, commits, { randomize: true });

  return buildDashboardReport(
    {
      repo: repo ?? randomPick(REPO_NAMES),
      analyzed_at: new Date().toISOString(),
      commit_count: commits.length,
    },
    stats,
    analysis,
    commits,
  );
}
