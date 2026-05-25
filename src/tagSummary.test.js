const { formatTagSection, buildTagSummary, buildTagStats, TAG_LABELS } = require('./tagSummary');

describe('formatTagSection', () => {
  it('formats a section with label and commit lines', () => {
    const commits = [
      { cleanMessage: 'add login', repo: 'api' },
      { cleanMessage: 'add signup', repo: null },
    ];
    const result = formatTagSection('feat', commits);
    expect(result).toContain('✨ Features');
    expect(result).toContain('- add login (api)');
    expect(result).toContain('- add signup');
    expect(result).not.toContain('add signup (');
  });

  it('uses fallback label for unknown tag', () => {
    const result = formatTagSection('unknown', [{ cleanMessage: 'something' }]);
    expect(result).toContain('📌 unknown');
  });

  it('returns empty string for empty commits array', () => {
    const result = formatTagSection('feat', []);
    expect(result).toBe('');
  });
});

describe('buildTagSummary', () => {
  it('returns no commits message for empty input', () => {
    expect(buildTagSummary([])).toBe('No commits found.');
    expect(buildTagSummary(null)).toBe('No commits found.');
  });

  it('builds a summary grouped by tag', () => {
    const commits = [
      { message: 'feat: new dashboard', repo: 'web' },
      { message: 'fix: null pointer', repo: 'api' },
      { message: 'chore: bump deps', repo: 'web' },
    ];
    const result = buildTagSummary(commits);
    expect(result).toContain('✨ Features');
    expect(result).toContain('🐛 Bug Fixes');
    expect(result).toContain('🔧 Chores');
    expect(result).toContain('new dashboard (web)');
    expect(result).toContain('null pointer (api)');
  });

  it('places known tags before other', () => {
    const commits = [
      { message: 'random commit' },
      { message: 'feat: cool thing' },
    ];
    const result = buildTagSummary(commits);
    const featIdx = result.indexOf('✨ Features');
    const otherIdx = result.indexOf('📌 Other');
    expect(featIdx).toBeLessThan(otherIdx);
  });

  it('handles commits with no conventional format gracefully', () => {
    const commits = [{ message: 'initial commit' }];
    const result = buildTagSummary(commits);
    expect(result).toContain('📌 Other');
    expect(result).toContain('initial commit');
  });

  it('does not include sections for tags with no commits', () => {
    const commits = [{ message: 'feat: only feature' }];
    const result = buildTagSummary(commits);
    expect(result).not.toContain('🐛 Bug Fixes');
    expect(result).not.toContain('🔧 Chores');
  });
});

describe('buildTagStats', () => {
  it('returns 0 commits for empty input', () => {
    expect(buildTagStats([])).toBe('0 commits');
    expect(buildTagStats(null)).toBe('0 commits');
  });

  it('returns a stats string', () => {
    const commits = [
      { message: 'feat: a' },
      { message: 'feat: b' },
      { message: 'fix: c' },
    ];
    const result = buildTagStats(commits);
    expect(result).toContain('2 feat');
    expect(result).toContain('1 fix');
  });
});

describe('TAG_LABELS', () => {
  it('has labels for all known tags', () => {
    expect(TAG_LABELS['feat']).toContain('Features');
    expect(TAG_LABELS['fix']).toContain('Bug Fixes');
    expect(TAG_LABELS['other']).toBeDefined();
  });
});
