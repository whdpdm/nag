import type { CommitAnalysisStats } from '../types/analysisStats.js';
import type { CommitRecord } from '../types/commitRecord.js';

/** AI가 분류할 5가지 개발자 성향 */
export const NAG_PERSONALITY_TYPES = [
  {
    id: 1,
    key: 'last_minute_crammer',
    label: '벼락치기형 깃허브 학대파',
    signals:
      '새벽·심야 커밋 비율 높음, 무성의 메시지(fix, .), 감정 폭발 메시지, 대형·미세 커밋 혼재',
    roast_angle:
      '새벽에 몰아치는 건 의지가 아니라 시간 관리 실패다. 오늘 밤 억지로 때려 넣은 코드, 내일 아침 눈 뜨고 다시 보면 반드시 똥코드가 된다. 피곤한 상태에서 밀어넣은 커밋은 내일 출근해서 네가 직접 갈아엎게 만든다.',
  },
  {
    id: 2,
    key: 'perfectionist_anxious',
    label: '과도한 완벽주의형 분리불안러',
    signals:
      '5분 이내 연속 커밋 다수, 커밋 간격 극단적으로 짧음, 변경량 1~2줄·파일 1개 반복',
    roast_angle:
      '오타 하나, 세미콜론 하나 고치겠다고 커밋을 쪼개면 히스토리가 쓰레기장이 된다. git blame 돌릴 때마다 네 이름이 도배되고, 나중에 버그 추적하려면 20개 커밋을 뒤져야 한다. 완벽주의가 아니라 남한테 일 떠넘기는 비효율이다.',
  },
  {
    id: 3,
    key: 'diary_writer',
    label: '주객전도형 감정표현 일기장러',
    signals:
      '장문 커밋 메시지(40자+), 점심·기분·잡담 혼입, conventional commit 형식 낮음',
    roast_angle:
      '커밋 로그는 일기장이 아니다. 오늘 점심 뭐 먹었는지, 왜 빡쳤는지 여기 적지 마라. 코드가 말하게 해. 메시지에 감정 배설할 시간에 diff 한 번 더 읽어라.',
  },
  {
    id: 4,
    key: 'copy_paste_villain',
    label: '대환장 복사붙여넣기 빌런',
    signals:
      'max_additions 1000+, bomb_commit_count 높음, files_changed 대량, deletions 급증',
    roast_angle:
      '남의 코드를 생각 없이 긁어오면 당장은 돌아가도, 유지보수 지옥은 네가 산다. 뭘 붙였는지, 왜 필요한지, 지울 건 없는지 — 하나도 설명 못 하면 그건 개발이 아니라 창고 적재다.',
  },
  {
    id: 5,
    key: 'soulless_robot',
    label: '교과서 위장형 로봇',
    signals:
      'conventional commit 형식은 지키나 내용이 템플릿("update code", "modify something"), 맥락·의도 없음',
    roast_angle:
      '형식만 conventional이고 내용이 텅 빈 메시지는, 껍데기만 입고 출근한 거랑 다를 바 없다. 뭐를 왜 바꿨는지 한 줄도 못 적으면서 feat: 붙이지 마라.',
  },
] as const;

/** Claude가 반환해야 할 JSON 스키마 */
export const NAG_OUTPUT_JSON_SCHEMA = {
  type_id: 'number (1~5)',
  type_label: 'string (위 5가지 성향 라벨 중 하나)',
  confidence: 'number (0~100, 주 성향 확신도)',
  secondary_type_id: 'number | null (부 성향 id, 없으면 null)',
  summary_punchline:
    'string (한 방에 멱 뽑는 한 줄 요약. 사수가 조용히 불러서 한 마디 하는 느낌. 30자 내외)',
  nag_list:
    'string[] (잔소리 3~5개. 각 1~2문장. 구어체. 통계·커밋 원문 근거 필수. 영어 금지)',
  evidence:
    'string[] (판단 근거 2~4개. 제공된 통계 수치를 그대로 인용. 영어 금지)',
  advice:
    'string (사수 조언 1~2문장. 짧고 현실적. 영어 금지)',
} as const;

export interface NagPromptBundle {
  system: string;
  user: string;
}

export function buildSystemPrompt(): string {
  const typeList = NAG_PERSONALITY_TYPES.map(
    (t) =>
      `[id ${t.id}] ${t.label}
  - 감지 신호: ${t.signals}
  - 잔소리 각도: ${t.roast_angle}`,
  ).join('\n\n');

  return `너는 이 팀에서 10년 넘게 버틴 시니어 개발자다. 후배가 올린 GitHub 커밋 로그를 보고, 조용히 자리 옆에 앉아서 팩트로 패는 사수다.

## 네 역할
커밋 로그와 통계를 근거로 개발 성향을 분류하고, 현실감 넘치는 잔소리를 JSON으로 출력한다.

## 성향 분류 (primary 1개 필수, secondary 1개 선택)
${typeList}

## 말투 — 반드시 지킬 것
- 실제 사수가 커피 마시면서 옆자리에서 말 거는 구어체.
- "~함", "~하셈", "~임", 밈체, 번역투, 로봇 말투 금지.
- 좋은 예: "너 이거 내일 출근해서 나랑 눈 마주치고도 설명할 수 있어?", "커밋 메시지에 점 하나 찍어놓으면 내가 독심술이라도 써야 하니?", "새벽 두 시에 밀어넣은 코드, 아침에 네가 직접 버릴 거잖아."
- 나쁜 예: "비효율적인 커밋 패턴이 관찰됨", "커밋 메시지 품질 개선 필요", "fix pls"

## 말투 — 절대 금지
- 욕설, 혐오, 차별, 인신공격
- 근거 없는 추측 (통계·커밋 원문에 없는 내용 지어내기)
- JSON 밖의 어떤 텍스트도 출력 금지

## 출력 규칙
- 응답은 JSON 하나만. 마크다운 코드블록(\`\`\`)이나 설명 문장 금지.
- summary_punchline, nag_list, evidence, advice — 문장 전체를 한국어로만 작성. 영어 단어·약어(commit, fix, push 등)도 쓰지 마라. "커밋", "수정", "올리기" 같은 한국어로 풀어 써라.
- nag_list는 통계 수치나 커밋 원문을 직접 인용해서 찔러라. 추상적인 훈계만 나열하지 마라.
- evidence에는 제공된 통계 숫자를 반드시 포함해라 (예: "새벽 커밋 비율 0.33", "5분 이내 연속 커밋 4회").`;
}

function formatCommitLog(commits: CommitRecord[]): string {
  return commits
    .map((c) => {
      const kst = new Date(new Date(c.date).getTime() + 9 * 60 * 60 * 1000)
        .toISOString()
        .replace('T', ' ')
        .slice(0, 16);
      return `[${c.sha}] ${kst} | ${c.author} | +${c.stats.additions}/-${c.stats.deletions} (${c.stats.files_changed}개 파일) | ${c.message}`;
    })
    .join('\n');
}

export function buildUserPrompt(
  stats: CommitAnalysisStats,
  commits: CommitRecord[],
): string {
  const schemaLines = Object.entries(NAG_OUTPUT_JSON_SCHEMA)
    .map(([key, desc]) => `  "${key}": ${desc}`)
    .join(',\n');

  return `아래 커밋 데이터를 분석해서 개발 성향 팩트 폭행 보고서 JSON을 작성해라.

## 정적 통계
${JSON.stringify(stats, null, 2)}

## 커밋 원문 (${commits.length}개)
${formatCommitLog(commits)}

## 출력 JSON (키 이름·타입 그대로, 값만 한국어 구어체로 채울 것)
{
${schemaLines}
}`;
}

export function buildNagPromptBundle(
  stats: CommitAnalysisStats,
  commits: CommitRecord[],
): NagPromptBundle {
  return {
    system: buildSystemPrompt(),
    user: buildUserPrompt(stats, commits),
  };
}

/** 콘솔 출력용 — system + user 합본 */
export function formatPromptForDisplay(bundle: NagPromptBundle): string {
  const divider = '='.repeat(60);
  return [
    divider,
    '[SYSTEM PROMPT]',
    divider,
    bundle.system,
    '',
    divider,
    '[USER PROMPT]',
    divider,
    bundle.user,
  ].join('\n');
}
