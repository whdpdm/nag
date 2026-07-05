export interface CommitStats {
  additions: number;
  deletions: number;
  files_changed: number;
}

export interface CommitRecord {
  sha: string;
  author: string;
  date: string;
  message: string;
  stats: CommitStats;
}

export interface FetchCommitsOptions {
  /** 기본 25, 허용 범위 20~30 */
  limit?: number;
  /** GITHUB_TOKEN — 미지정 시 process.env에서 읽음 */
  token?: string;
}

export const DEFAULT_COMMIT_LIMIT = 25;
export const MIN_COMMIT_LIMIT = 20;
export const MAX_COMMIT_LIMIT = 30;
