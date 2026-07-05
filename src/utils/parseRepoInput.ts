import { InvalidRepoInputError } from '../errors/githubErrors.js';

export interface ParsedRepo {
  owner: string;
  repo: string;
}

const GITHUB_URL_PATTERN =
  /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/?#]+?)(?:\.git)?\/?(?:[?#].*)?$/i;

const OWNER_REPO_PATTERN = /^([^/]+)\/([^/]+)$/;

/**
 * GitHub 레포 URL 또는 "owner/repo" 문자열을 파싱합니다.
 */
export function parseRepoInput(input: string): ParsedRepo {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new InvalidRepoInputError(input);
  }

  const urlMatch = trimmed.match(GITHUB_URL_PATTERN);
  if (urlMatch) {
    return normalizeRepo(urlMatch[1], urlMatch[2]);
  }

  const slugMatch = trimmed.match(OWNER_REPO_PATTERN);
  if (slugMatch) {
    return normalizeRepo(slugMatch[1], slugMatch[2]);
  }

  throw new InvalidRepoInputError(input);
}

function normalizeRepo(owner: string, repo: string): ParsedRepo {
  const normalizedOwner = owner.trim();
  const normalizedRepo = repo.replace(/\.git$/i, '').trim();

  if (!normalizedOwner || !normalizedRepo) {
    throw new InvalidRepoInputError(`${owner}/${repo}`);
  }

  return { owner: normalizedOwner, repo: normalizedRepo };
}
