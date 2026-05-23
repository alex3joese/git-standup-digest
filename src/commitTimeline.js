/**
 * commitTimeline.js
 * Groups commits into time buckets (morning, afternoon, evening, night)
 * and builds a timeline view for the digest.
 */

const BUCKETS = [
  { label: 'Morning',   start: 6,  end: 12 },
  { label: 'Afternoon', start: 12, end: 17 },
  { label: 'Evening',   start: 17, end: 21 },
  { label: 'Night',     start: 21, end: 6  },
];

/**
 * Returns the time-of-day bucket label for a given Date.
 * @param {Date} date
 * @returns {string}
 */
function getBucket(date) {
  const hour = date.getHours();
  for (const bucket of BUCKETS) {
    if (bucket.start < bucket.end) {
      if (hour >= bucket.start && hour < bucket.end) return bucket.label;
    } else {
      // wraps midnight
      if (hour >= bucket.start || hour < bucket.end) return bucket.label;
    }
  }
  return 'Night';
}

/**
 * Groups an array of commit objects by time-of-day bucket.
 * Each commit must have a `date` field (Date or ISO string).
 * @param {Array<object>} commits
 * @returns {Record<string, Array<object>>}
 */
function groupByTimeBucket(commits) {
  const result = {};
  for (const commit of commits) {
    const date = commit.date instanceof Date ? commit.date : new Date(commit.date);
    const bucket = getBucket(date);
    if (!result[bucket]) result[bucket] = [];
    result[bucket].push(commit);
  }
  return result;
}

/**
 * Formats a timeline section for display.
 * @param {string} label
 * @param {Array<object>} commits
 * @returns {string}
 */
function formatTimelineSection(label, commits) {
  const lines = [`[${label}]`];
  for (const c of commits) {
    const time = (c.date instanceof Date ? c.date : new Date(c.date))
      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    lines.push(`  ${time} ${c.repo ? `(${c.repo}) ` : ''}${c.message}`);
  }
  return lines.join('\n');
}

/**
 * Builds a full timeline string from a list of commits.
 * @param {Array<object>} commits
 * @returns {string}
 */
function buildTimeline(commits) {
  const buckets = groupByTimeBucket(commits);
  const order = ['Morning', 'Afternoon', 'Evening', 'Night'];
  const sections = order
    .filter(label => buckets[label] && buckets[label].length > 0)
    .map(label => formatTimelineSection(label, buckets[label]));
  return sections.join('\n\n');
}

module.exports = { getBucket, groupByTimeBucket, formatTimelineSection, buildTimeline };
