/**
 * tagParser.js
 * Parses semantic tags/labels from commit messages (e.g. feat:, fix:, chore:)
 */

const KNOWN_TAGS = ['feat', 'fix', 'chore', 'docs', 'refactor', 'test', 'style', 'perf', 'ci', 'build'];

const CONVENTIONAL_RE = /^(\w+)(\([^)]+\))?!?:\s+(.+)$/;

/**
 * Parse a conventional commit message into { tag, scope, message }
 * Returns null if not a conventional commit.
 * @param {string} commitMessage
 * @returns {{ tag: string, scope: string|null, message: string } | null}
 */
function parseConventionalCommit(commitMessage) {
  if (!commitMessage || typeof commitMessage !== 'string') return null;
  const match = commitMessage.trim().match(CONVENTIONAL_RE);
  if (!match) return null;
  const [, tag, scopeRaw, message] = match;
  const scope = scopeRaw ? scopeRaw.replace(/[()]/g, '') : null;
  return { tag: tag.toLowerCase(), scope, message };
}

/**
 * Returns the tag for a commit message, or 'other' if unrecognized.
 * @param {string} commitMessage
 * @returns {string}
 */
function extractTag(commitMessage) {
  const parsed = parseConventionalCommit(commitMessage);
  if (!parsed) return 'other';
  return KNOWN_TAGS.includes(parsed.tag) ? parsed.tag : 'other';
}

/**
 * Group an array of commit objects by their semantic tag.
 * @param {Array<{ message: string }>} commits
 * @returns {Record<string, Array>}
 */
function groupByTag(commits) {
  const groups = {};
  for (const commit of commits) {
    const tag = extractTag(commit.message);
    if (!groups[tag]) groups[tag] = [];
    groups[tag].push(commit);
  }
  return groups;
}

/**
 * Annotate each commit with its parsed tag and scope.
 * @param {Array<{ message: string }>} commits
 * @returns {Array}
 */
function annotateWithTags(commits) {
  return commits.map((commit) => {
    const parsed = parseConventionalCommit(commit.message);
    return {
      ...commit,
      tag: parsed ? (KNOWN_TAGS.includes(parsed.tag) ? parsed.tag : 'other') : 'other',
      scope: parsed ? parsed.scope : null,
      cleanMessage: parsed ? parsed.message : commit.message,
    };
  });
}

module.exports = { parseConventionalCommit, extractTag, groupByTag, annotateWithTags, KNOWN_TAGS };
