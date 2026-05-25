// Analyzes commit pace: morning vs afternoon vs evening patterns

const HOUR_BUCKETS = {
  morning: [5, 11],
  afternoon: [12, 17],
  evening: [18, 22],
  night: [23, 4],
};

function getHourBucket(date) {
  const hour = new Date(date).getHours();
  if (hour >= 5 && hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 17) return 'afternoon';
  if (hour >= 18 && hour <= 22) return 'evening';
  return 'night';
}

function countByBucket(commits) {
  const counts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  for (const commit of commits) {
    const bucket = getHourBucket(commit.date);
    counts[bucket]++;
  }
  return counts;
}

function peakBucket(counts) {
  return Object.entries(counts).reduce(
    (best, [key, val]) => (val > best[1] ? [key, val] : best),
    ['none', -1]
  )[0];
}

function buildPaceSummary(commits) {
  if (!commits || commits.length === 0) {
    return { counts: { morning: 0, afternoon: 0, evening: 0, night: 0 }, peak: 'none', total: 0 };
  }
  const counts = countByBucket(commits);
  const peak = peakBucket(counts);
  return { counts, peak, total: commits.length };
}

function formatPaceReport(summary) {
  const { counts, peak, total } = summary;
  const lines = ['📈 Commit Pace Analysis', ''];
  for (const [bucket, count] of Object.entries(counts)) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const bar = '█'.repeat(Math.round(pct / 5));
    const label = bucket.charAt(0).toUpperCase() + bucket.slice(1);
    lines.push(`  ${label.padEnd(10)} ${bar.padEnd(20)} ${count} commits (${pct}%)`);
  }
  lines.push('');
  lines.push(`  Peak time: ${peak}`);
  return lines.join('\n');
}

module.exports = { getHourBucket, countByBucket, peakBucket, buildPaceSummary, formatPaceReport };
