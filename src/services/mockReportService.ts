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

function inferPersonality(stats: CommitAnalysisStats): InferredPersonality {
  const scores = scoreType(stats);
  const ranked = (Object.entries(scores) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => Number(id) as PersonalityId);

  const primary = ranked[0];
  const secondary = ranked[1] && scores[ranked[1]] > 0 ? ranked[1] : null;
  const top = scores[primary];
  const second = secondary ? scores[secondary] : 0;
  const confidence = Math.min(
    95,
    Math.max(55, Math.round(60 + (top - second) * 2)),
  );

  return { primary, secondary, confidence };
}

function labelOf(id: PersonalityId): string {
  return NAG_PERSONALITY_TYPES.find((t) => t.id === id)?.label ?? '';
}

function buildNagList(
  typeId: PersonalityId,
  stats: CommitAnalysisStats,
  commits: CommitRecord[],
): string[] {
  const sample = commits[0]?.message ?? '';
  const dawn = pct(stats.dawn_commit_ratio);
  const lazy = pct(stats.message.lazy_message_ratio);
  const burst = stats.timing.burst_commit_count;
  const maxAdd = stats.stats.max_additions;
  const diary = pct(stats.message.diary_style_ratio);

  const byType: Record<PersonalityId, string[]> = {
    1: [
      `새벽 커밋 비율이 ${dawn}%야. 오늘 밤 억지로 밀어 넣은 거, 내일 아침 네가 직접 버릴 각오는 하고 있지?`,
      lazy > 0
        ? `무성의 메시지가 ${lazy}%나 돼. "${sample.slice(0, 20)}${sample.length > 20 ? '…' : ''}" 이게 뭔지 내일 출근해서 설명해봐.`
        : `심야에 올린 커밋 ${stats.total_commits}개 중 상당수가 피로 누적 구간이야. 잠 줄이면 코드 품질부터 무너진다.`,
      `최대 ${maxAdd}줄짜리 변경을 새벽에 밀어 넣었어. 리뷰도 안 받고 merge 하면 똥코드는 네 몫이야.`,
    ],
    2: [
      `5분 이내 연속 커밋이 ${burst}번이야. 오타 하나 고치겠다고 히스토리를 쪼개면 나중에 누가 뭐 바꿨는지 추적 못 해.`,
      `최단 간격 ${stats.timing.min_gap_minutes}분. 커밋이 안 남는 게 아니라, 남기기 싫어서 미세하게 쪼개는 거잖아.`,
      `미세 커밋 ${stats.stats.micro_commit_count}건. 변경 줄 수는 1~2줄인데 기록만 ${stats.total_commits}개 쌓였어. 이게 효율이라고?`,
    ],
    3: [
      `장문 메시지 비율 ${diary}%. 커밋 로그는 일기장이 아니야. 점심 뭐 먹었는지 여기 적지 마.`,
      `평균 메시지 길이 ${stats.message.avg_length}자. 감정은 털어놓고 코드는 설명을 안 하네?`,
      `"${sample.slice(0, 30)}${sample.length > 30 ? '…' : ''}" — 이걸 읽으면 뭐가 바뀌었는지 한 줄도 모르겠어. 코드로 말해.`,
    ],
    4: [
      `한 번에 ${maxAdd}줄을 추가했어. 뭘 긁어왔는지, 왜 필요한지, 지울 건 없는지 설명부터 해.`,
      `폭탄 커밋 ${stats.stats.bomb_commit_count}건, 최대 ${stats.stats.max_files_changed}개 파일 동시 변경. 당장은 돌아가도 유지보수는 네가 산다.`,
      `총 ${stats.stats.total_additions}줄 추가. 복사해 온 코드는 레포에 쌓일수록 기술 부채만 커져.`,
    ],
    5: [
      `형식은 갖췄는데 내용이 텅 빈 메시지가 반복돼. "${sample.slice(0, 25)}${sample.length > 25 ? '…' : ''}" — 뭐를 왜 바꿨는지 한 줄도 없잖아.`,
      `관례적 메시지 비율은 ${pct(stats.message.conventional_ratio)}%인데, 읽어도 맥락이 없어. 껍데기만 입고 출근한 거랑 다를 바 없어.`,
      `감정도 없고 의도도 없는 기록 ${stats.total_commits}개. 나중에 네가 봐도 뭐 했는지 모를 거야.`,
    ],
  };

  return byType[typeId];
}

function buildEvidence(
  stats: CommitAnalysisStats,
  typeId: PersonalityId,
): string[] {
  const base = [
    `분석 커밋 ${stats.total_commits}개, 기간 ${stats.date_range.span_hours}시간`,
    `새벽 커밋 비율 ${pct(stats.dawn_commit_ratio)}%`,
    `무성의 메시지 비율 ${pct(stats.message.lazy_message_ratio)}%`,
    `5분 이내 연속 커밋 ${stats.timing.burst_commit_count}회`,
    `최대 추가 ${stats.stats.max_additions}줄`,
  ];

  const extra: Partial<Record<PersonalityId, string>> = {
    3: `장문 메시지 비율 ${pct(stats.message.diary_style_ratio)}%`,
    4: `폭탄 커밋 ${stats.stats.bomb_commit_count}건`,
    5: `관례적 메시지 비율 ${pct(stats.message.conventional_ratio)}%`,
  };

  const picked = [base[0], base[1], base[2], extra[typeId] ?? base[3]].filter(
    Boolean,
  ) as string[];

  return picked.slice(0, 4);
}

const PUNCHLINES: Record<PersonalityId, string> = {
  1: '새벽에 때려 넣은 코드, 아침에 네가 직접 갈아엎을 각오는 돼 있지?',
  2: '오타 하나 고치겠다고 히스토리 쪼개면, 나중에 추적은 네가 한다.',
  3: '커밋 로그에 감정 쏟지 말고, 코드로 말해.',
  4: '생각 없이 긁어 온 코드, 유지보수 지옥은 네 몫이야.',
  5: '형식만 갖춘 메시지, 읽는 사람 시간만 뺏어.',
};

const ADVICE: Record<PersonalityId, string> = {
  1: '밤늦게 밀지 말고, 내일 낮에 쪼개서 올려. 피로 상태에서 올린 기록은 반드시 되돌아온다.',
  2: '로컬에서 수정 모아서 한 번에 올려. 히스토리는 남들이 읽는 문서다.',
  3: '메시지는 "뭐를, 왜"만 적어. 일기는 따로 써.',
  4: '긁어 온 코드마다 출처·이유·제거 계획을 메시지에 남겨.',
  5: '관례적 접두사만 붙이지 말고, 변경 의도를 한 줄이라도 적어.',
};

/**
 * Claude API 없이 정적 통계 기반 가짜 AI 분석 JSON 생성 (UI 목킹용)
 */
export function generateMockAnalysis(
  stats: CommitAnalysisStats,
  commits: CommitRecord[],
): NagAnalysisResult {
  const { primary, secondary, confidence } = inferPersonality(stats);

  return {
    type_id: primary,
    type_label: labelOf(primary),
    confidence,
    secondary_type_id: secondary,
    summary_punchline: PUNCHLINES[primary],
    nag_list: buildNagList(primary, stats, commits),
    evidence: buildEvidence(stats, primary),
    advice: ADVICE[primary],
  };
}
