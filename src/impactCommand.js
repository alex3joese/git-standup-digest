const { buildImpactSummary } = require('./commitImpactScore');

function renderScoreBar(score, max = 60) {
  const filled = Math.min(Math.round((score / max) * 20), 20);
  return '[' + '█'.repeat(filled) + '░'.repeat(20 - filled) + ']';
}

function formatImpactReport(summary, opts = {}) {
  const { topCommits, averageScore, totalScore } = summary;
  const limit = opts.limit || 5;
  const lines = [];

  lines.push('=== Commit Impact Report ===');
  lines.push(`Average score : ${averageScore}`);
  lines.push(`Total score   : ${totalScore}`);
  lines.push('');
  lines.push('Top commits by impact:');

  topCommits.slice(0, limit).forEach((c, i) => {
    const bar = renderScoreBar(c.impactScore);
    const short = c.message.length > 55 ? c.message.slice(0, 52) + '...' : c.message;
    lines.push(`  ${i + 1}. ${bar} ${c.impactScore.toFixed(1).padStart(6)}  ${short}`);
    if (c.repo) lines.push(`       repo: ${c.repo}  date: ${c.date || 'unknown'}`);
  });

  if (topCommits.length === 0) {
    lines.push('  (no commits found)');
  }

  return lines.join('\n');
}

function handleImpactCommand(commits, opts = {}, out = console.log) {
  if (!commits || commits.length === 0) {
    out('No commits to analyse.');
    return;
  }
  const summary = buildImpactSummary(commits);
  out(formatImpactReport(summary, opts));
  return summary;
}

module.exports = { renderScoreBar, formatImpactReport, handleImpactCommand };
