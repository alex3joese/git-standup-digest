const {
  detectMood,
  getMoodEmoji,
  annotateCommitsWithMood,
  buildMoodSummary,
} = require('./commitMoodDetector');

describe('detectMood', () => {
  it('detects fix mood', () => {
    expect(detectMood('fix broken login')).toBe('fix');
    expect(detectMood('fixes #123')).toBe('fix');
    expect(detectMood('hotfix for crash')).toBe('fix');
  });

  it('detects feat mood', () => {
    expect(detectMood('add new dashboard')).toBe('feat');
    expect(detectMood('implement search feature')).toBe('feat');
    expect(detectMood('new user profile page')).toBe('feat');
  });

  it('detects perf mood', () => {
    expect(detectMood('optimize query performance')).toBe('perf');
    expect(detectMood('make rendering faster')).toBe('perf');
  });

  it('detects refactor mood', () => {
    expect(detectMood('refactor auth module')).toBe('refactor');
    expect(detectMood('cleanup old code')).toBe('refactor');
  });

  it('detects test mood', () => {
    expect(detectMood('add tests for parser')).toBe('test');
    expect(detectMood('improve coverage')).toBe('test');
  });

  it('detects docs mood', () => {
    expect(detectMood('update README')).toBe('docs');
    expect(detectMood('add documentation for API')).toBe('docs');
  });

  it('detects chore mood', () => {
    expect(detectMood('bump lodash to 4.17.21')).toBe('chore');
    expect(detectMood('upgrade dependencies')).toBe('chore');
  });

  it('returns unknown for unrecognized messages', () => {
    expect(detectMood('wip')).toBe('unknown');
    expect(detectMood('')).toBe('unknown');
    expect(detectMood(null)).toBe('unknown');
  });
});

describe('getMoodEmoji', () => {
  it('returns correct emoji for known moods', () => {
    expect(getMoodEmoji('fix')).toBe('🐛');
    expect(getMoodEmoji('feat')).toBe('✨');
    expect(getMoodEmoji('docs')).toBe('📝');
  });

  it('returns unknown emoji for unknown mood', () => {
    expect(getMoodEmoji('unknown')).toBe('❓');
    expect(getMoodEmoji('nope')).toBe('❓');
  });
});

describe('annotateCommitsWithMood', () => {
  it('adds mood field to each commit', () => {
    const commits = [
      { hash: 'a1', message: 'fix crash on startup' },
      { hash: 'b2', message: 'add new chart component' },
    ];
    const result = annotateCommitsWithMood(commits);
    expect(result[0]).toMatchObject({ hash: 'a1', mood: 'fix' });
    expect(result[1]).toMatchObject({ hash: 'b2', mood: 'feat' });
  });
});

describe('buildMoodSummary', () => {
  it('returns sorted mood counts with emojis', () => {
    const commits = [
      { message: 'fix bug' },
      { message: 'fix another bug' },
      { message: 'add feature' },
      { message: 'update docs' },
    ];
    const summary = buildMoodSummary(commits);
    expect(summary[0]).toMatchObject({ mood: 'fix', count: 2, emoji: '🐛' });
    expect(summary.length).toBeGreaterThan(0);
  });

  it('handles empty commit list', () => {
    expect(buildMoodSummary([])).toEqual([]);
  });
});
