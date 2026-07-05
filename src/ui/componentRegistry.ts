import type {
  AdviceFooterProps,
  CommitTimelineItemProps,
  EvidencePanelProps,
  NagBubbleProps,
  PersonalityBadgeProps,
  ReportHeaderProps,
  StatCardProps,
  UIComponentDefinition,
} from '../types/uiComponents.js';

export const UI_COMPONENT_IDS = {
  REPORT_HEADER: 'ReportHeader',
  PERSONALITY_BADGE: 'PersonalityBadge',
  PUNCHLINE: 'PunchlineBanner',
  NAG_BUBBLE_LIST: 'NagBubbleList',
  STAT_CARD_GRID: 'StatCardGrid',
  EVIDENCE_PANEL: 'EvidencePanel',
  ADVICE_FOOTER: 'AdviceFooter',
  COMMIT_TIMELINE: 'CommitTimeline',
} as const;

export type UIComponentId =
  (typeof UI_COMPONENT_IDS)[keyof typeof UI_COMPONENT_IDS];

export const COMPONENT_REGISTRY: UIComponentDefinition[] = [
  {
    id: UI_COMPONENT_IDS.REPORT_HEADER,
    name: 'ReportHeader',
    description: '레포 이름, 분석 시각, 커밋 수, 기간 요약',
    targetPath: 'src/components/ReportHeader.tsx',
    propsType: 'ReportHeaderProps',
  },
  {
    id: UI_COMPONENT_IDS.PERSONALITY_BADGE,
    name: 'PersonalityBadge',
    description: '주·부 성향 뱃지, 확신도, 테마 색상',
    targetPath: 'src/components/PersonalityBadge.tsx',
    propsType: 'PersonalityBadgeProps',
  },
  {
    id: UI_COMPONENT_IDS.PUNCHLINE,
    name: 'PunchlineBanner',
    description: 'summary_punchline 한 줄 팩폭 배너',
    targetPath: 'src/components/PunchlineBanner.tsx',
    propsType: 'string',
  },
  {
    id: UI_COMPONENT_IDS.NAG_BUBBLE_LIST,
    name: 'NagBubbleList',
    description: '사수 말풍선 잔소리 목록 (nag_list)',
    targetPath: 'src/components/NagBubbleList.tsx',
    propsType: 'NagBubbleProps[]',
  },
  {
    id: UI_COMPONENT_IDS.STAT_CARD_GRID,
    name: 'StatCardGrid',
    description: '정적 통계 카드 그리드',
    targetPath: 'src/components/StatCardGrid.tsx',
    propsType: 'StatCardProps[]',
  },
  {
    id: UI_COMPONENT_IDS.EVIDENCE_PANEL,
    name: 'EvidencePanel',
    description: 'AI 판단 근거 목록',
    targetPath: 'src/components/EvidencePanel.tsx',
    propsType: 'EvidencePanelProps',
  },
  {
    id: UI_COMPONENT_IDS.ADVICE_FOOTER,
    name: 'AdviceFooter',
    description: '사수 조언 푸터',
    targetPath: 'src/components/AdviceFooter.tsx',
    propsType: 'AdviceFooterProps',
  },
  {
    id: UI_COMPONENT_IDS.COMMIT_TIMELINE,
    name: 'CommitTimeline',
    description: '커밋 원문 타임라인',
    targetPath: 'src/components/CommitTimeline.tsx',
    propsType: 'CommitTimelineItemProps[]',
  },
];

/** React 이식 시 Props 타입 re-export 편의 */
export type ComponentPropsMap = {
  [UI_COMPONENT_IDS.REPORT_HEADER]: ReportHeaderProps;
  [UI_COMPONENT_IDS.PERSONALITY_BADGE]: PersonalityBadgeProps;
  [UI_COMPONENT_IDS.PUNCHLINE]: string;
  [UI_COMPONENT_IDS.NAG_BUBBLE_LIST]: NagBubbleProps[];
  [UI_COMPONENT_IDS.STAT_CARD_GRID]: StatCardProps[];
  [UI_COMPONENT_IDS.EVIDENCE_PANEL]: EvidencePanelProps;
  [UI_COMPONENT_IDS.ADVICE_FOOTER]: AdviceFooterProps;
  [UI_COMPONENT_IDS.COMMIT_TIMELINE]: CommitTimelineItemProps[];
};
