/**
 * tagSummary.js
 * Builds a human-readable tag-based summary section for the digest.
 */

const { groupByTag, annotateWithTags, KNOWN_TAGS } = require('./tagParser');

const TAG_LABELS = {
  feat: '✨ Features',
  fix: '🐛 Bug Fixes',
  chore: '🔧 Chores',
  docs: '📝 Docs',
  refactor: '♻️  Refactors',
  test: '🧪 Tests',
  style: '💅 Style',
  perf: '⚡ Performance',
  ci: '⚙️  CI',
  build: '🏗️  Build',
  other: '📌 Other',
};

/**
 * Format a tag group section as a string.
 * @param {string} tag
 * @param {Array<{ cleanMessage: string, repo?: string }>} commits
 * @returns {string}
 */
function formatTagSection(tag, commits) {
  const label = TAG_LABELS[tag] || `📌 ${tag}`;
  const lines = commits.map((c) => {
    const repoNote = c.repo ? ` (${c.repo})` : '';
    return `  - ${c.cleanMessage}${repoNote}`;
  });
  return `${label}\n${lines.join('\n')}`;
}

/**
 * Build a full tag-based summary from a list of commits.
 * @param {Array<{ message: string, repo?: string }>} commits
 * @returns {string}
 */
function buildTagSummary(commits) {
  if (!commits || commits.length === 0) return 'No commits found.';

  const annotated = annotateWithTags(commits);
  const groups = groupByTag(annotated);

  const orderedTags = [...KNOWN_TAGS, 'other'].filter((t) => groups[t] && groups[t].length > 0);

  if (orderedTags.length === 0) return 'No commits found.';

  return orderedTags.map((tag) => formatTagSection(tag, groups[tag])).join('\n\n');
}

/**
 * Returns a short stats line, e.g. "3 feat, 2 fix, 1 other"
 * @param {Array<{ message: string }>} commits
 * @returns {string}
 */
function buildTagStats(commits) {
  if (!commits || commits.length === 0) return '0 commits';
  const groups = groupByTag(commits);
  return Object.entries(groups)
    .map(([tag, list]) => `${list.length} ${tag}`)
    .join(', ');
}

module.exports = { formatTagSection, buildTagSummary, buildTagStats, TAG_LABELS };
