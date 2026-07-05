import { NAG_PERSONALITY_TYPES } from '../prompts/nagTemplates.js';
import type { CommitAnalysisStats } from '../types/analysisStats.js';
import type { CommitRecord } from '../types/commitRecord.js';
import type { NagAnalysisResult } from '../types/uiComponents.js';

type PersonalityId = 1 | 2 | 3 | 4 | 5;

interface InferredPersonality {
  primary: PersonalityId;
  secondary: PersonalityId | null;
  confidence: number;
}

export interface MockAnalysisOptions {
  /** true면 잔소리·확신도 등을 매 실행마다 다양하게 */
  randomize?: boolean;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pct(ratio: number): number {
  return Math.round(ratio * 100);
}

function scoreType(stats: CommitAnalysisStats): Record<PersonalityId, number> {
  return {
    1:
      stats.dawn_commit_ratio * 40 +
      stats.late_night_commit_ratio * 20 +
      stats.message.lazy_message_ratio * 30 +
      stats.stats.bomb_commit_count * 5,
    2:
      stats.timing.burst_commit_count * 15 +
      (stats.timing.min_gap_minutes < 10 ? 25 : 0) +
      stats.stats.micro_commit_count * 3,
    3:
      stats.message.diary_style_ratio * 40 +
      (1 - stats.message.conventional_ratio) * 20 +
      (stats.message.avg_length > 30 ? 15 : 0),
    4:
      stats.stats.bomb_commit_count * 30 +
      (stats.stats.max_additions >= 500 ? 25 : 0) +
      (stats.stats.max_files_changed >= 10 ? 15 : 0),
    5:
      stats.message.conventional_ratio * 30 +
      (stats.message.lazy_message_ratio < 0.1 ? 15 : 0) +
      (stats.message.diary_style_ratio < 0.1 ? 15 : 0),
  };
}

function inferPersonality(
  stats: CommitAnalysisStats,
  randomize: boolean,
): InferredPersonality {
  const scores = scoreType(stats);
  const ranked = (Object.entries(scores) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => Number(id) as PersonalityId);

  let primary = ranked[0];
  let secondary = ranked[1] && scores[ranked[1]] > 0 ? ranked[1] : null;

  if (randomize && Math.random() < 0.3) {
    primary = randomPick([1, 2, 3, 4, 5] as PersonalityId[]);
    secondary = randomPick([1, 2, 3, 4, 5].filter((id) => id !== primary) as PersonalityId[]);
  }

  const top = scores[primary];
  const second = secondary ? scores[secondary] : 0;
  const confidence = randomize
    ? randomInt(58, 97)
    : Math.min(95, Math.max(55, Math.round(60 + (top - second) * 2)));

  return { primary, secondary, confidence };
}

function labelOf(id: PersonalityId): string {
  return NAG_PERSONALITY_TYPES.find((t) => t.id === id)?.label ?? '';
}

const NAG_POOL: Record<PersonalityId, string[]> = {
  1: [
    '새벽 커밋 비율이 {dawn}%야. 오늘 밤 억지로 밀어 넣은 거, 내일 아침 네가 직접 버릴 각오는 하고 있지?',
    '무성의 메시지가 {lazy}%나 돼. "{sample}" 이게 뭔지 내일 출근해서 설명해봐.',
    '심야에 올린 커밋 {total}개 중 상당수가 피로 누적 구간이야. 잠 줄이면 코드 품질부터 무너진다.',
    '최대 {maxAdd}줄짜리 변경을 새벽에 밀어 넣었어. 리뷰도 안 받고 merge 하면 똥코드는 네 몫이야.',
    '새벽 두 시에 올린 기록 {total}개. 아침에 눈 뜨고 diff부터 다시 볼 각오는 하고 있지?',
    '"{sample}" — 메시지만 봐도 어제 밤 정신 상태가 보인다.',
  ],
  2: [
    '5분 이내 연속 커밋이 {burst}번이야. 오타 하나 고치겠다고 히스토리를 쪼개면 나중에 추적 못 해.',
    '최단 간격 {minGap}분. 커밋이 안 남는 게 아니라, 남기기 싫어서 미세하게 쪼개는 거잖아.',
    '미세 커밋 {micro}건. 변경 줄 수는 1~2줄인데 기록만 {total}개 쌓였어. 이게 효율이라고?',
    '엔터 하나 고치겠다고 {burst}번 연속 올렸네. git blame 돌릴 때 네 이름만 도배된다.',
    '오타 수정인데 {files}개 파일을 건드렸다고? 솔직히 말해봐, 뭐 다른 것도 섞었지?',
  ],
  3: [
    '장문 메시지 비율 {diary}%. 커밋 로그는 일기장이 아니야. 점심 뭐 먹었는지 여기 적지 마.',
    '평균 메시지 길이 {avgLen}자. 감정은 털어놓고 코드는 설명을 안 하네?',
    '"{sample}" — 이걸 읽으면 뭐가 바뀌었는지 한 줄도 모르겠어. 코드로 말해.',
    '감정 배설 {diary}%인데 conventional 형식은 {conv}%. 형식도 내용도 주객전도야.',
    '커밋 메시지에 잡담 넣을 시간에 테스트 하나 더 돌려.',
  ],
  4: [
    '한 번에 {maxAdd}줄을 추가했어. 뭘 긁어왔는지, 왜 필요한지, 지울 건 없는지 설명부터 해.',
    '폭탄 커밋 {bomb}건, 최대 {maxFiles}개 파일 동시 변경. 당장은 돌아가도 유지보수는 네가 산다.',
    '총 {totalAdd}줄 추가. 복사해 온 코드는 레포에 쌓일수록 기술 부채만 커져.',
    '{maxAdd}줄짜리 변경인데 메시지는 "{sample}". 이 정도면 복붙인 거 다 알아.',
    '삭제 {maxDel}줄, 추가 {maxAdd}줄. 대규모 변경인데 리뷰 요청은 안 올렸네?',
  ],
  5: [
    '형식은 갖췄는데 내용이 텅 빈 메시지가 반복돼. "{sample}" — 뭐를 왜 바꿨는지 한 줄도 없잖아.',
    '관례적 메시지 비율 {conv}%인데, 읽어도 맥락이 없어. 껍데기만 입고 출근한 거랑 다를 바 없어.',
    '감정도 없고 의도도 없는 기록 {total}개. 나중에 네가 봐도 뭐 했는지 모를 거야.',
    'feat, fix 붙이는 건 무료가 아니야. "{sample}" 수준이면 접두사 빼는 게 나아.',
    'conventional 형식 {conv}%인데 내용은 템플릿 그대로. 로봇이 쓴 줄 알았어.',
  ],
};

const PUNCHLINE_POOL: Record<PersonalityId, string[]> = {
  1: [
    '새벽에 때려 넣은 코드, 아침에 네가 직접 갈아엎을 각오는 돼 있지?',
    '밤샘 커밋 {total}개? 내일 커피값은 회사에 청구할 거야?',
    '새벽 {dawn}%? 잠은 자고 코딩하냐?',
  ],
  2: [
    '오타 하나 고치겠다고 히스토리 쪼개면, 나중에 추적은 네가 한다.',
    '커밋 {burst}번 연속? 히스토리가 쓰레기장이 됐어.',
    '1줄 수정에 커밋 {total}개. 이게 완벽주의야, 강박이야?',
  ],
  3: [
    '커밋 로그에 감정 쏟지 말고, 코드로 말해.',
    '일기장은 노션에 써. 여기는 git이야.',
    '메시지 {avgLen}자? 출판사에 보낼 거면 말해.',
  ],
  4: [
    '생각 없이 긁어 온 코드, 유지보수 지옥은 네 몫이야.',
    '{maxAdd}줄 한 방? 복붙 출처부터 말해.',
    '폭탄 커밋 {bomb}건. 터지면 네가 맞는다.',
  ],
  5: [
    '형식만 갖춘 메시지, 읽는 사람 시간만 뺏어.',
    '"update code"가 메시지면, 나도 "update review" 할게.',
    '텅 빈 conventional. 영혼 없는 로봇이네.',
  ],
};

const ADVICE_POOL: Record<PersonalityId, string[]> = {
  1: [
    '밤늦게 밀지 말고, 내일 낮에 쪼개서 올려. 피로 상태에서 올린 기록은 반드시 되돌아온다.',
    '새벽 커밋 줄이고, 중요한 건 리뷰 받고 merge해.',
    '23시 이후 커밋은 다음 날 아침에 다시 봐.',
  ],
  2: [
    '로컬에서 수정 모아서 한 번에 올려. 히스토리는 남들이 읽는 문서다.',
    '1줄 수정은 amend나 squash로 정리해.',
    '커밋 쪼개기 전에 "이거 꼭 분리해야 하나?" 스스로에게 물어봐.',
  ],
  3: [
    '메시지는 "뭐를, 왜"만 적어. 일기는 따로 써.',
    '감정은 슬랙에, 변경 의도는 커밋에.',
    '메시지 50자 넘으면 잘라. 핵심만.',
  ],
  4: [
    '긁어 온 코드마다 출처·이유·제거 계획을 메시지에 남겨.',
    '대량 변경은 PR 단위로 쪼개.',
    '복붙 전에 "내가 이 코드 설명할 수 있나?" 확인해.',
  ],
  5: [
    '관례적 접두사만 붙이지 말고, 변경 의도를 한 줄이라도 적어.',
    'feat: 뒤에 실제 변경 내용을 써.',
    '미래의 네가 읽을 거라고 생각하고 메시지 써.',
  ],
};

interface TemplateVars {
  dawn: number;
  lazy: number;
  burst: number;
  minGap: number;
  maxAdd: number;
  maxDel: number;
  maxFiles: number;
  diary: number;
  conv: number;
  avgLen: number;
  total: number;
  micro: number;
  bomb: number;
  totalAdd: number;
  sample: string;
}

function fillTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{(\w+)\}/g, (_, key: keyof TemplateVars) =>
    String(vars[key] ?? ''),
  );
}

function buildTemplateVars(
  stats: CommitAnalysisStats,
  commits: CommitRecord[],
): TemplateVars {
  const sample = commits[0]?.message ?? 'fix';
  const trimmed =
    sample.length > 28 ? `${sample.slice(0, 28)}…` : sample;

  return {
    dawn: pct(stats.dawn_commit_ratio),
    lazy: pct(stats.message.lazy_message_ratio),
    burst: stats.timing.burst_commit_count,
    minGap: Math.round(stats.timing.min_gap_minutes),
    maxAdd: stats.stats.max_additions,
    maxDel: stats.stats.max_deletions,
    maxFiles: stats.stats.max_files_changed,
    diary: pct(stats.message.diary_style_ratio),
    conv: pct(stats.message.conventional_ratio),
    avgLen: Math.round(stats.message.avg_length),
    total: stats.total_commits,
    micro: stats.stats.micro_commit_count,
    bomb: stats.stats.bomb_commit_count,
    totalAdd: stats.stats.total_additions,
    sample: trimmed,
  };
}

function buildNagList(
  typeId: PersonalityId,
  stats: CommitAnalysisStats,
  commits: CommitRecord[],
  randomize: boolean,
): string[] {
  const vars = buildTemplateVars(stats, commits);
  const pool = NAG_POOL[typeId].map((t) => fillTemplate(t, vars));

  if (!randomize) {
    return pool.slice(0, 3);
  }

  const count = randomInt(3, 5);
  return shuffle(pool).slice(0, count);
}

function buildEvidence(
  stats: CommitAnalysisStats,
  typeId: PersonalityId,
): string[] {
  const base = [
    `분석 커밋 ${stats.total_commits}개, 기간 ${Math.round(stats.date_range.span_hours)}시간`,
    `새벽 커밋 비율 ${pct(stats.dawn_commit_ratio)}%`,
    `무성의 메시지 비율 ${pct(stats.message.lazy_message_ratio)}%`,
    `5분 이내 연속 커밋 ${stats.timing.burst_commit_count}회`,
    `최대 추가 ${stats.stats.max_additions}줄`,
    `평균 메시지 ${Math.round(stats.message.avg_length)}자`,
    `폭탄 커밋 ${stats.stats.bomb_commit_count}건`,
    `장문 메시지 ${pct(stats.message.diary_style_ratio)}%`,
  ];

  const extra: Partial<Record<PersonalityId, string>> = {
    3: `장문 메시지 비율 ${pct(stats.message.diary_style_ratio)}%`,
    4: `폭탄 커밋 ${stats.stats.bomb_commit_count}건`,
    5: `관례적 메시지 ${pct(stats.message.conventional_ratio)}%`,
  };

  const picked = shuffle([
    base[0],
    base[1],
    base[2],
    extra[typeId] ?? base[randomInt(3, base.length - 1)],
    base[randomInt(4, base.length - 1)],
  ]);

  return picked.slice(0, 4);
}

/**
 * Claude API 없이 정적 통계 기반 가짜 AI 분석 JSON 생성 (UI 목킹용)
 */
export function generateMockAnalysis(
  stats: CommitAnalysisStats,
  commits: CommitRecord[],
  options: MockAnalysisOptions = {},
): NagAnalysisResult {
  const randomize = options.randomize ?? false;
  const { primary, secondary, confidence } = inferPersonality(stats, randomize);
  const vars = buildTemplateVars(stats, commits);

  const punchlinePool = PUNCHLINE_POOL[primary].map((t) =>
    fillTemplate(t, vars),
  );
  const advicePool = ADVICE_POOL[primary];

  return {
    type_id: primary,
    type_label: labelOf(primary),
    confidence,
    secondary_type_id: secondary,
    summary_punchline: randomize
      ? randomPick(punchlinePool)
      : punchlinePool[0],
    nag_list: buildNagList(primary, stats, commits, randomize),
    evidence: buildEvidence(stats, primary),
    advice: randomize ? randomPick(advicePool) : advicePool[0],
  };
}
