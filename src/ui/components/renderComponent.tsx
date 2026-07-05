import type { ReactNode } from 'react';
import type { NagDashboardViewModel } from '../../types/uiComponents.js';
import { UI_COMPONENT_IDS } from '../componentRegistry.js';
import { AdviceFooter } from './AdviceFooter.js';
import { CommitTimeline } from './CommitTimeline.js';
import { EvidencePanel } from './EvidencePanel.js';
import { NagBubbleList } from './NagBubbleList.js';
import { PersonalityBadge } from './PersonalityBadge.js';
import { PunchlineBanner } from './PunchlineBanner.js';
import { ReportHeader } from './ReportHeader.js';
import { StatCardGrid } from './StatCardGrid.js';

export function renderComponent(
  componentId: string,
  view: NagDashboardViewModel,
  dataKey: keyof NagDashboardViewModel,
): ReactNode {
  switch (componentId) {
    case UI_COMPONENT_IDS.REPORT_HEADER:
      return <ReportHeader {...view.header} />;
    case UI_COMPONENT_IDS.PERSONALITY_BADGE:
      return <PersonalityBadge {...view.personality} />;
    case UI_COMPONENT_IDS.PUNCHLINE:
      return <PunchlineBanner text={view.punchline} />;
    case UI_COMPONENT_IDS.NAG_BUBBLE_LIST:
      return <NagBubbleList items={view.nagBubbles} />;
    case UI_COMPONENT_IDS.STAT_CARD_GRID:
      return <StatCardGrid cards={view.statCards} />;
    case UI_COMPONENT_IDS.EVIDENCE_PANEL:
      return <EvidencePanel {...view.evidence} />;
    case UI_COMPONENT_IDS.COMMIT_TIMELINE:
      return <CommitTimeline items={view.commitTimeline} />;
    case UI_COMPONENT_IDS.ADVICE_FOOTER:
      return <AdviceFooter {...view.advice} />;
    default:
      return (
        <p className="text-sm text-red-500">
          알 수 없는 컴포넌트: {componentId} ({dataKey})
        </p>
      );
  }
}

const SECTION_CLASS: Record<string, string> = {
  hero: 'space-y-4',
  nag: 'space-y-3 rounded-xl border border-red-100 bg-red-50 p-6',
  stats: 'space-y-6',
  timeline: 'space-y-4',
  footer: '',
};

const SECTION_TITLE_CLASS: Record<string, string> = {
  hero: 'sr-only',
  nag: 'text-sm font-semibold text-red-800',
  stats: 'text-sm font-semibold text-gray-500',
  timeline: 'text-sm font-semibold text-gray-500',
  footer: 'sr-only',
};

export function sectionClass(sectionId: string): string {
  return SECTION_CLASS[sectionId] ?? 'space-y-4';
}

export function sectionTitleClass(sectionId: string): string {
  return SECTION_TITLE_CLASS[sectionId] ?? 'text-sm font-semibold text-gray-500';
}
