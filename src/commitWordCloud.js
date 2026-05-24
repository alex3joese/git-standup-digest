/**
 * commitWordCloud.js
 * Builds a simple word frequency map from commit messages
 * for generating a text-based word cloud summary.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'it', 'its', 'this', 'that', 'not', 'up',
]);

function tokenize(message) {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function buildWordFrequency(commits) {
  const freq = {};
  for (const commit of commits) {
    const words = tokenize(commit.message || '');
    for (const word of words) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }
  return freq;
}

function topWords(freq, limit = 20) {
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

function renderWordCloud(words, maxWidth = 60) {
  if (!words.length) return '(no data)';
  const maxCount = words[0].count;
  const lines = words.map(({ word, count }) => {
    const barLen = Math.max(1, Math.round((count / maxCount) * 20));
    const bar = '█'.repeat(barLen);
    return `  ${word.padEnd(20)} ${bar} ${count}`;
  });
  return lines.join('\n');
}

function buildWordCloud(commits, limit = 20) {
  const freq = buildWordFrequency(commits);
  const words = topWords(freq, limit);
  return { words, rendered: renderWordCloud(words) };
}

module.exports = { tokenize, buildWordFrequency, topWords, renderWordCloud, buildWordCloud };
