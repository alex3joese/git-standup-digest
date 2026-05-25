// commitFileStats.js — Aggregates file-level change stats across commits

/**
 * Extracts all changed files from an array of commits (with diffStat annotations).
 * @param {Array} commits
 * @returns {Array<{file: string, additions: number, deletions: number, changes: number}>}
 */
function aggregateFileStats(commits) {
  const map = new Map();

  for (const commit of commits) {
    const files = commit.diffStat?.files || [];
    for (const f of files) {
      const key = f.file;
      if (!map.has(key)) {
        map.set(key, { file: key, additions: 0, deletions: 0, changes: 0 });
      }
      const entry = map.get(key);
      entry.additions += f.additions || 0;
      entry.deletions += f.deletions || 0;
      entry.changes += 1;
    }
  }

  return Array.from(map.values());
}

/**
 * Returns the top N most frequently changed files.
 * @param {Array} fileStats
 * @param {number} n
 * @returns {Array}
 */
function topChangedFiles(fileStats, n = 5) {
  return [...fileStats]
    .sort((a, b) => b.changes - a.changes)
    .slice(0, n);
}

/**
 * Formats a single file stat row for display.
 * @param {object} stat
 * @returns {string}
 */
function formatFileStatRow(stat) {
  const adds = `+${stat.additions}`.padStart(6);
  const dels = `-${stat.deletions}`.padStart(6);
  return `  ${stat.file.padEnd(40)} ${adds}  ${dels}  (${stat.changes} commit${stat.changes !== 1 ? 's' : ''})`;
}

/**
 * Builds a full file stats report string.
 * @param {Array} commits
 * @param {number} topN
 * @returns {string}
 */
function buildFileStatsReport(commits, topN = 5) {
  const stats = aggregateFileStats(commits);
  if (stats.length === 0) return 'No file stats available.';

  const top = topChangedFiles(stats, topN);
  const lines = [
    `Top ${top.length} changed file${top.length !== 1 ? 's' : ''}:`,
    '',
    `  ${'File'.padEnd(40)} ${'Adds'.padStart(6)}  ${'Dels'.padStart(6)}  Commits`,
    `  ${'-'.repeat(65)}`,
    ...top.map(formatFileStatRow),
  ];

  return lines.join('\n');
}

module.exports = {
  aggregateFileStats,
  topChangedFiles,
  formatFileStatRow,
  buildFileStatsReport,
};
