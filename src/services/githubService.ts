import type { RestEndpointMethodTypes } from '@octokit/rest';
import { RequestError } from '@octokit/request-error';
import pLimit from 'p-limit';
import { createOctokit, type GitHubOctokit } from '../config/github.js';
import {
  GitHubServiceError,
  InvalidTokenError,
  RateLimitError,
  RepoAccessDeniedError,
  RepoNotFoundError,
} from '../errors/githubErrors.js';
import {
  CommitRecord,
  DEFAULT_COMMIT_LIMIT,
  FetchCommitsOptions,
  MAX_COMMIT_LIMIT,
  MIN_COMMIT_LIMIT,
} from '../types/commitRecord.js';
import { parseRepoInput } from '../utils/parseRepoInput.js';

export { parseRepoInput };

type ListedCommit =
  RestEndpointMethodTypes['repos']['listCommits']['response']['data'][number];

const DETAIL_CONCURRENCY = 5;

function resolveLimit(limit?: number): number {
  const envLimit = process.env.COMMIT_FETCH_LIMIT
    ? Number.parseInt(process.env.COMMIT_FETCH_LIMIT, 10)
    : undefined;

  const candidate = limit ?? envLimit ?? DEFAULT_COMMIT_LIMIT;

  if (Number.isNaN(candidate)) {
    return DEFAULT_COMMIT_LIMIT;
  }

  return Math.min(MAX_COMMIT_LIMIT, Math.max(MIN_COMMIT_LIMIT, candidate));
}

function extractSubject(message: string): string {
  return message.split('\n')[0]?.trim() ?? '';
}

function extractAuthor(commit: ListedCommit): string {
  return (
    commit.commit.author?.name ??
    commit.author?.login ??
    commit.commit.committer?.name ??
    'unknown'
  );
}

function extractDate(commit: ListedCommit): string {
  const date =
    commit.commit.author?.date ?? commit.commit.committer?.date ?? null;

  if (!date) {
    throw new GitHubServiceError(
      `커밋 ${commit.sha}의 날짜 정보를 찾을 수 없습니다.`,
    );
  }

  return date;
}

function toPartialRecord(commit: ListedCommit): Omit<CommitRecord, 'stats'> {
  return {
    sha: commit.sha.slice(0, 7),
    author: extractAuthor(commit),
    date: extractDate(commit),
    message: extractSubject(commit.commit.message),
  };
}

function handleGitHubError(error: unknown, owner: string, repo: string): never {
  if (error instanceof RequestError) {
    if (error.status === 401) {
      throw new InvalidTokenError();
    }

    if (error.status === 404) {
      throw new RepoNotFoundError(owner, repo);
    }

    if (error.status === 403) {
      const isRateLimit =
        error.message.toLowerCase().includes('rate limit') ||
        error.response?.headers?.['x-ratelimit-remaining'] === '0';

      if (isRateLimit) {
        throw new RateLimitError();
      }

      throw new RepoAccessDeniedError(owner, repo);
    }

    if (error.status === 429) {
      throw new RateLimitError();
    }
  }

  throw error;
}

async function fetchCommitStats(
  owner: string,
  repo: string,
  sha: string,
  octokit: GitHubOctokit,
): Promise<CommitRecord['stats']> {
  const { data } = await octokit.rest.repos.getCommit({
    owner,
    repo,
    ref: sha,
  });

  return {
    additions: data.stats?.additions ?? 0,
    deletions: data.stats?.deletions ?? 0,
    files_changed: data.files?.length ?? 0,
  };
}

/**
 * GitHub REST API로 최근 커밋을 수집해 mockCommits.json 호환 형식으로 반환합니다.
 */
export async function fetchRecentCommits(
  owner: string,
  repo: string,
  options: FetchCommitsOptions = {},
): Promise<CommitRecord[]> {
  const limit = resolveLimit(options.limit);
  const octokit = createOctokit(options.token);

  let listedCommits: ListedCommit[] = [];

  try {
    const response = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: limit,
    });
    listedCommits = response.data;
  } catch (error) {
    handleGitHubError(error, owner, repo);
  }

  if (listedCommits.length === 0) {
    return [];
  }

  const limitConcurrency = pLimit(DETAIL_CONCURRENCY);

  const records = await Promise.all(
    listedCommits.map((commit) =>
      limitConcurrency(async (): Promise<CommitRecord> => {
        try {
          const partial = toPartialRecord(commit);
          const stats = await fetchCommitStats(
            owner,
            repo,
            commit.sha,
            octokit,
          );
          return { ...partial, stats };
        } catch (error) {
          if (error instanceof GitHubServiceError) {
            throw error;
          }
          return handleGitHubError(error, owner, repo);
        }
      }),
    ),
  );

  return records;
}

/**
 * URL 또는 "owner/repo" 입력을 받아 최근 커밋을 수집합니다.
 */
export async function fetchRecentCommitsFromInput(
  input: string,
  options: FetchCommitsOptions = {},
): Promise<CommitRecord[]> {
  const { owner, repo } = parseRepoInput(input);
  return fetchRecentCommits(owner, repo, options);
}
