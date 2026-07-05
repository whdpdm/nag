import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import {
  fetchRecentCommitsFromInput,
  GitHubServiceError,
} from '../src/index.js';

const input = process.argv[2];

if (!input) {
  console.error('Usage: npm run fetch-commits -- <owner/repo | GitHub URL>');
  process.exit(1);
}

try {
  const commits = await fetchRecentCommitsFromInput(input);
  const output = JSON.stringify(commits, null, 2);

  console.log(output);

  writeFileSync('commits-output.json', output);
  console.error(`\n✓ ${commits.length}개 커밋 수집 완료 → commits-output.json`);
} catch (error) {
  if (error instanceof GitHubServiceError) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
  process.exit(1);
}
