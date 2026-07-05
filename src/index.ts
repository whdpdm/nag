export {
  GitHubServiceError,
  InvalidRepoInputError,
  InvalidTokenError,
  RateLimitError,
  RepoAccessDeniedError,
  RepoNotFoundError,
} from './errors/githubErrors.js';
export { createOctokit } from './config/github.js';
export type { GitHubOctokit } from './config/github.js';
export {
  fetchRecentCommits,
  fetchRecentCommitsFromInput,
  parseRepoInput,
} from './services/githubService.js';
export {
  DEFAULT_COMMIT_LIMIT,
  MAX_COMMIT_LIMIT,
  MIN_COMMIT_LIMIT,
} from './types/commitRecord.js';
export type {
  CommitRecord,
  CommitStats,
  FetchCommitsOptions,
} from './types/commitRecord.js';
export type { CommitAnalysisStats } from './types/analysisStats.js';
export type {
  NagPromptBundle,
} from './prompts/nagTemplates.js';
export {
  NAG_OUTPUT_JSON_SCHEMA,
  NAG_PERSONALITY_TYPES,
  buildNagPromptBundle,
  buildSystemPrompt,
  buildUserPrompt,
  formatPromptForDisplay,
} from './prompts/nagTemplates.js';
export { analyzeCommits } from './services/analyzerService.js';
export { buildDashboardReport, buildDashboardViewModel } from './services/reportBuilder.js';
export { generateMockAnalysis } from './services/mockReportService.js';
export { COMPONENT_REGISTRY, UI_COMPONENT_IDS } from './ui/componentRegistry.js';
export type { ComponentPropsMap, UIComponentId } from './ui/componentRegistry.js';
export { DASHBOARD_LAYOUT } from './ui/dashboardLayout.js';
export type {
  AdviceFooterProps,
  CommitTimelineItemProps,
  DashboardLayoutSection,
  EvidencePanelProps,
  LayoutComponentSlot,
  NagAnalysisResult,
  NagBubbleProps,
  NagDashboardReport,
  NagDashboardViewModel,
  NagReportMeta,
  PersonalityBadgeProps,
  PersonalityTheme,
  ReportHeaderProps,
  StatCardProps,
  UIComponentDefinition,
} from './types/uiComponents.js';
export type { ParsedRepo } from './utils/parseRepoInput.js';
