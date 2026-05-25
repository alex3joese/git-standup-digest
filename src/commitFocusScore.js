// Computes a "focus score" for a set of commits based on how consistent
// the commit topics/tags are within a time window.

const { parseConventionalCommit } = require('./tagParser');

/**
 * Count occurrences of each type (feat, fix, chore, etc.) in commits.
 * @param {object[]} commits
 * @returns {Record<string, number>}
 */
function countTypes(commits) {
  const counts = {};
  for (const commit of commits) {
    const { type } = parseConventionalCommit(commit.message);
    const key = type || 'other';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

/**
 * Compute a focus score 0-100 based on how dominated the work is by a single type.
 * 100 = all commits are the same type, 0 = perfectly spread.
 * @param {object[]} commits
 * @returns {number}
 */
function computeFocusScore(commits) {
  if (!commits || commits.length === 0) return 0;
  const counts = countTypes(commits);
  const total = commits.length;
  const max = Math.max(...Object.values(counts));
  return Math.round((max / total) * 100);
}

/**
 * Return a human-readable focus label.
 * @param {number} score
 * @returns {string}
 */
function focusLabel(score) {
  if (score >= 80) return 'Highly Focused';
  if (score >= 55) return 'Moderately Focused';
  if (score >= 35) return 'Mixed';
  return 'Scattered';
}

/**
 * Build a focus summary object.
 * @param {object[]} commits
 * @returns {{ score: number, label: string, typeCounts: Record<string, number> }}
 */
function buildFocusSummary(commits) {
  const score = computeFocusScore(commits);
  const label = focusLabel(score);
  const typeCounts = countTypes(commits);
  return { score, label, typeCounts };
}

module.exports = { countTypes, computeFocusScore, focusLabel, buildFocusSummary };
