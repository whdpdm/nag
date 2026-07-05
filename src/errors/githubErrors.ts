export class GitHubServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubServiceError';
  }
}

export class InvalidRepoInputError extends GitHubServiceError {
  constructor(input: string) {
    super(`유효하지 않은 레포지토리 입력입니다: "${input}"`);
    this.name = 'InvalidRepoInputError';
  }
}

export class RepoNotFoundError extends GitHubServiceError {
  constructor(owner: string, repo: string) {
    super(`레포지토리를 찾을 수 없습니다: ${owner}/${repo}`);
    this.name = 'RepoNotFoundError';
  }
}

export class RepoAccessDeniedError extends GitHubServiceError {
  constructor(owner: string, repo: string) {
    super(
      `레포지토리에 접근할 수 없습니다: ${owner}/${repo} (private 레포는 GITHUB_TOKEN이 필요합니다)`,
    );
    this.name = 'RepoAccessDeniedError';
  }
}

export class RateLimitError extends GitHubServiceError {
  constructor() {
    super('GitHub API rate limit에 도달했습니다. 잠시 후 다시 시도하세요.');
    this.name = 'RateLimitError';
  }
}

export class InvalidTokenError extends GitHubServiceError {
  constructor() {
    super(
      'GITHUB_TOKEN이 유효하지 않습니다. .env의 토큰을 확인하거나 제거 후 다시 시도하세요.',
    );
    this.name = 'InvalidTokenError';
  }
}
