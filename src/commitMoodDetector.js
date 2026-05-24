/**
 * Detects the "mood" of a commit based on its message keywords.
 * Moods: 'fix', 'feat', 'chore', 'refactor', 'test', 'docs', 'perf', 'unknown'
 */

const MOOD_PATTERNS = [
  { mood: 'fix',      patterns: [/\bfix(es|ed|ing)?\b/i, /\bbug\b/i, /\bhotfix\b/i, /\bpatch\b/i] },
  { mood: 'feat',     patterns: [/\bfeat(ure)?\b/i, /\badd(s|ed|ing)?\b/i, /\bnew\b/i, /\bimplement/i] },
  { mood: 'perf',     patterns: [/\bperf(ormance)?\b/i, /\boptimiz/i, /\bspeed\b/i, /\bfast(er)?\b/i] },
  { mood: 'refactor', patterns: [/\brefactor/i, /\bclean(up)?\b/i, /\brestructure/i, /\bmove\b/i] },
  { mood: 'test',     patterns: [/\btest(s|ing|ed)?\b/i, /\bspec\b/i, /\bcoverage\b/i] },
  { mood: 'docs',     patterns: [/\bdoc(s|ument(ation)?)?\b/i, /\breadme\b/i, /\bcomment(s)?\b/i, /\bchangelog\b/i] },
  { mood: 'chore',    patterns: [/\bchore\b/i, /\bdep(s|endenc)/i, /\bupgrade\b/i, /\bbump\b/i, /\bupdate\b/i] },
];

const MOOD_EMOJI = {
  fix:      '🐛',
  feat:     '✨',
  perf:     '⚡',
  refactor: '♻️',
  test:     '🧪',
  docs:     '📝',
  chore:    '🔧',
  unknown:  '❓',
};

function detectMood(message) {
  if (!message || typeof message !== 'string') return 'unknown';
  for (const { mood, patterns } of MOOD_PATTERNS) {
    if (patterns.some((re) => re.test(message))) {
      return mood;
    }
  }
  return 'unknown';
}

function getMoodEmoji(mood) {
  return MOOD_EMOJI[mood] || MOOD_EMOJI.unknown;
}

function annotateCommitsWithMood(commits) {
  return commits.map((commit) => ({
    ...commit,
    mood: detectMood(commit.message),
  }));
}

function buildMoodSummary(commits) {
  const counts = {};
  for (const commit of commits) {
    const mood = detectMood(commit.message);
    counts[mood] = (counts[mood] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([mood, count]) => ({ mood, count, emoji: getMoodEmoji(mood) }));
}

module.exports = { detectMood, getMoodEmoji, annotateCommitsWithMood, buildMoodSummary };
