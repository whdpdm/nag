import type { DashboardLayoutSection } from '../types/uiComponents.js';
import { UI_COMPONENT_IDS } from './componentRegistry.js';

/**
 * 대시보드 화면 배치 순서.
 * React 이식 시 이 배열을 map 돌려 섹션·컴포넌트를 렌더링하면 됨.
 */
export const DASHBOARD_LAYOUT: DashboardLayoutSection[] = [
  {
    sectionId: 'hero',
    title: '리포트 헤더',
    components: [
      { componentId: UI_COMPONENT_IDS.REPORT_HEADER, dataKey: 'header' },
      { componentId: UI_COMPONENT_IDS.PERSONALITY_BADGE, dataKey: 'personality' },
      { componentId: UI_COMPONENT_IDS.PUNCHLINE, dataKey: 'punchline' },
    ],
  },
  {
    sectionId: 'nag',
    title: '잔소리',
    components: [
      { componentId: UI_COMPONENT_IDS.NAG_BUBBLE_LIST, dataKey: 'nagBubbles' },
    ],
  },
  {
    sectionId: 'stats',
    title: '팩트 통계',
    components: [
      { componentId: UI_COMPONENT_IDS.STAT_CARD_GRID, dataKey: 'statCards' },
      { componentId: UI_COMPONENT_IDS.EVIDENCE_PANEL, dataKey: 'evidence' },
    ],
  },
  {
    sectionId: 'timeline',
    title: '커밋 원문',
    components: [
      { componentId: UI_COMPONENT_IDS.COMMIT_TIMELINE, dataKey: 'commitTimeline' },
    ],
  },
  {
    sectionId: 'footer',
    title: '사수 조언',
    components: [
      { componentId: UI_COMPONENT_IDS.ADVICE_FOOTER, dataKey: 'advice' },
    ],
  },
];
