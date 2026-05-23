/**
 * commitDeduplicator.js
 * Removes duplicate commits across repos based on commit hash or message+author.
 */

/**
 * Deduplicate commits by their hash.
 * @param {Array} commits
 * @returns {Array}
 */
function deduplicateByHash(commits) {
  const seen = new Set();
  return commits.filter((commit) => {
    if (seen.has(commit.hash)) return false;
    seen.add(commit.hash);
    return true;
  });
}

/**
 * Build a fingerprint string for a commit based on message + author.
 * @param {Object} commit
 * @returns {string}
 */
function commitFingerprint(commit) {
  const msg = (commit.message || '').trim().toLowerCase();
  const author = (commit.author || '').trim().toLowerCase();
  return `${author}::${msg}`;
}

/**
 * Deduplicate commits by message + author fingerprint.
 * Useful when the same commit appears in multiple repos with different hashes.
 * @param {Array} commits
 * @returns {Array}
 */
function deduplicateByFingerprint(commits) {
  const seen = new Set();
  return commits.filter((commit) => {
    const fp = commitFingerprint(commit);
    if (seen.has(fp)) return false;
    seen.add(fp);
    return true;
  });
}

/**
 * Deduplicate commits using hash first, then fingerprint fallback.
 * @param {Array} commits
 * @param {{ strategy?: 'hash' | 'fingerprint' | 'both' }} options
 * @returns {Array}
 */
function deduplicateCommits(commits, options = {}) {
  const { strategy = 'hash' } = options;
  if (!Array.isArray(commits)) return [];
  if (strategy === 'fingerprint') return deduplicateByFingerprint(commits);
  if (strategy === 'both') return deduplicateByFingerprint(deduplicateByHash(commits));
  return deduplicateByHash(commits);
}

module.exports = {
  deduplicateByHash,
  deduplicateByFingerprint,
  commitFingerprint,
  deduplicateCommits,
};
