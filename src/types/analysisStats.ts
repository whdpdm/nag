/** LLM에 전달할 커밋 정적 통계 */
export interface CommitAnalysisStats {
  total_commits: number;
  date_range: {
    first: string;
    last: string;
    span_hours: number;
  };

  /** 00:00~05:59 KST 커밋 비율 */
  dawn_commit_ratio: number;
  /** 22:00~05:59 KST 커밋 비율 (심야+새벽) */
  late_night_commit_ratio: number;
  /** 평일(월~금) KST 커밋 비율 */
  weekday_commit_ratio: number;

  message: {
    avg_length: number;
    max_length: number;
    min_length: number;
    /** "fix", "." 등 무성의 메시지 비율 */
    lazy_message_ratio: number;
    /** 40자 이상 장문 메시지 비율 */
    diary_style_ratio: number;
    /** conventional commit 형식 비율 */
    conventional_ratio: number;
    samples: string[];
  };

  timing: {
    /** 연속 커밋 평균 간격(분) */
    avg_gap_minutes: number;
    /** 최단 커밋 간격(분) */
    min_gap_minutes: number;
    /** 5분 이내 연속 커밋 횟수 */
    burst_commit_count: number;
  };

  stats: {
    avg_additions: number;
    max_additions: number;
    total_additions: number;
    avg_deletions: number;
    max_deletions: number;
    avg_files_changed: number;
    max_files_changed: number;
    /** additions 500+ 또는 files 20+ */
    bomb_commit_count: number;
    /** 변경량 20줄 이하 & 파일 2개 이하 */
    micro_commit_count: number;
  };

  authors: {
    unique_count: number;
    names: string[];
  };
}
