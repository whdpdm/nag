import type { CommitAnalysisStats } from './analysisStats.js';
import type { CommitRecord } from './commitRecord.js';

/** Claude가 반환하는 AI 분석 JSON (프롬프트 스키마와 1:1) */
export interface NagAnalysisResult {
  type_id: 1 | 2 | 3 | 4 | 5;
  type_label: string;
  confidence: number;
  secondary_type_id: 1 | 2 | 3 | 4 | 5 | null;
  summary_punchline: string;
  nag_list: string[];
  evidence: string[];
  advice: string;
}

/** 리포트 메타 — 레포·분석 시각 */
export interface NagReportMeta {
  repo: string;
  analyzed_at: string;
  commit_count: number;
}

/** 프론트엔드로 전달하는 최종 통합 리포트 (AI + 정적 통계 + 원본 커밋) */
export interface NagDashboardReport {
  meta: NagReportMeta;
  analysis: NagAnalysisResult;
  stats: CommitAnalysisStats;
  commits: CommitRecord[];
  /** UI 컴포넌트에 바로 꽂을 수 있는 뷰 모델 */
  view: NagDashboardViewModel;
}

// --- 컴포넌트 Props (React 이식 시 그대로 사용) ---

export interface ReportHeaderProps {
  repo: string;
  analyzedAt: string;
  commitCount: number;
  dateRangeLabel: string;
}

export interface PersonalityBadgeProps {
  typeId: 1 | 2 | 3 | 4 | 5;
  typeLabel: string;
  confidence: number;
  secondaryTypeLabel: string | null;
  theme: PersonalityTheme;
}

export interface PersonalityTheme {
  accent: string;
  badge: string;
}

export interface NagBubbleProps {
  index: number;
  text: string;
}

export interface StatCardProps {
  label: string;
  value: string;
  tone: 'neutral' | 'warning' | 'danger';
}

export interface CommitTimelineItemProps {
  sha: string;
  dateLabel: string;
  author: string;
  message: string;
  additions: number;
  deletions: number;
  filesChanged: number;
}

export interface EvidencePanelProps {
  items: string[];
}

export interface AdviceFooterProps {
  text: string;
}

/** 대시보드 전체 뷰 모델 — layout.dataKey 와 1:1 매핑 */
export interface NagDashboardViewModel {
  header: ReportHeaderProps;
  personality: PersonalityBadgeProps;
  punchline: string;
  nagBubbles: NagBubbleProps[];
  statCards: StatCardProps[];
  evidence: EvidencePanelProps;
  advice: AdviceFooterProps;
  commitTimeline: CommitTimelineItemProps[];
}

/** 가상 컴포넌트 정의 — React 컴포넌트 이식용 청사진 */
export interface UIComponentDefinition<TProps = Record<string, never>> {
  id: string;
  name: string;
  description: string;
  /** React 이식 시 예상 파일 경로 */
  targetPath: string;
  propsType: string;
  defaultProps?: Partial<TProps>;
}

/** 레이아웃 섹션 내 컴포넌트 배치 */
export interface LayoutComponentSlot {
  componentId: string;
  /** NagDashboardViewModel 키 */
  dataKey: keyof NagDashboardViewModel;
}

export interface DashboardLayoutSection {
  sectionId: string;
  title: string;
  components: LayoutComponentSlot[];
}
