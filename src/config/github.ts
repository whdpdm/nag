import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';

const ThrottledOctokit = Octokit.plugin(throttling) as typeof Octokit;

export type GitHubOctokit = InstanceType<typeof ThrottledOctokit>;

export function createOctokit(token?: string): GitHubOctokit {
  const authToken = token ?? process.env.GITHUB_TOKEN;

  return new ThrottledOctokit({
    auth: authToken?.trim() || undefined,
    userAgent: 'nag-git-data-collector',
    throttle: {
      onRateLimit: (retryAfter, options, octokit, retryCount) => {
        octokit.log.warn(
          `Rate limit hit for ${options.method} ${options.url}. Retrying after ${retryAfter}s`,
        );
        return retryCount < 2;
      },
      onSecondaryRateLimit: (retryAfter, options, octokit) => {
        octokit.log.warn(
          `Secondary rate limit hit for ${options.method} ${options.url}. Retrying after ${retryAfter}s`,
        );
        return retryAfter <= 60;
      },
    },
  });
}
