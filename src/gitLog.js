const { execSync } = require('child_process');
const path = require('path');

/**
 * Fetches git commits from a repository since a given date.
 * @param {string} repoPath - Absolute or relative path to the git repo.
 * @param {string} since - Date string, e.g. '1 day ago' or '2024-01-01'
 * @param {string} author - Git author name or email to filter by (optional)
 * @returns {Array<{hash: string, date: string, message: string, repo: string}>}
 */
function getCommits(repoPath, since = '1 day ago', author = null) {
  const resolvedPath = path.resolve(repoPath);
  const authorFlag = author ? `--author="${author}"` : '';
  const format = '%H|%ad|%s';
  const dateFormat = '--date=short';

  const cmd = [
    'git',
    '-C', `"${resolvedPath}"`,
    'log',
    `--since="${since}"`,
    authorFlag,
    `--pretty=format:"${format}"`,
    dateFormat,
    '--no-merges'
  ].filter(Boolean).join(' ');

  let output = '';
  try {
    output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (err) {
    // Not a git repo or no commits — return empty
    return [];
  }

  if (!output) return [];

  const repoName = path.basename(resolvedPath);

  return output.split('\n').map(line => {
    // Remove surrounding quotes added by the format string
    const clean = line.replace(/^"|"$/g, '');
    const [hash, date, ...messageParts] = clean.split('|');
    return {
      hash: hash.trim(),
      date: date.trim(),
      message: messageParts.join('|').trim(),
      repo: repoName
    };
  }).filter(c => c.hash && c.message);
}

module.exports = { getCommits };
