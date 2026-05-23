const {
  parseConventionalCommit,
  extractTag,
  groupByTag,
  annotateWithTags,
  KNOWN_TAGS,
} = require('./tagParser');

describe('parseConventionalCommit', () => {
  it('parses a simple conventional commit', () => {
    const result = parseConventionalCommit('feat: add login page');
    expect(result).toEqual({ tag: 'feat', scope: null, message: 'add login page' });
  });

  it('parses a commit with scope', () => {
    const result = parseConventionalCommit('fix(auth): handle token expiry');
    expect(result).toEqual({ tag: 'fix', scope: 'auth', message: 'handle token expiry' });
  });

  it('returns null for non-conventional messages', () => {
    expect(parseConventionalCommit('update stuff')).toBeNull();
    expect(parseConventionalCommit('')).toBeNull();
    expect(parseConventionalCommit(null)).toBeNull();
  });

  it('lowercases the tag', () => {
    const result = parseConventionalCommit('FEAT: something');
    expect(result.tag).toBe('feat');
  });
});

describe('extractTag', () => {
  it('returns known tag for conventional commit', () => {
    expect(extractTag('fix: correct typo')).toBe('fix');
    expect(extractTag('chore: update deps')).toBe('chore');
  });

  it('returns other for unknown tag', () => {
    expect(extractTag('random: do something')).toBe('other');
    expect(extractTag('just a plain message')).toBe('other');
  });
});

describe('groupByTag', () => {
  it('groups commits by tag', () => {
    const commits = [
      { message: 'feat: new button' },
      { message: 'fix: crash on load' },
      { message: 'feat: dark mode' },
      { message: 'random commit' },
    ];
    const groups = groupByTag(commits);
    expect(groups['feat']).toHaveLength(2);
    expect(groups['fix']).toHaveLength(1);
    expect(groups['other']).toHaveLength(1);
  });

  it('returns empty object for empty array', () => {
    expect(groupByTag([])).toEqual({});
  });
});

describe('annotateWithTags', () => {
  it('annotates commits with tag, scope, cleanMessage', () => {
    const commits = [{ message: 'feat(ui): add sidebar', hash: 'abc123' }];
    const result = annotateWithTags(commits);
    expect(result[0]).toMatchObject({
      tag: 'feat',
      scope: 'ui',
      cleanMessage: 'add sidebar',
      hash: 'abc123',
    });
  });

  it('sets tag to other and cleanMessage to original for non-conventional', () => {
    const commits = [{ message: 'misc update' }];
    const result = annotateWithTags(commits);
    expect(result[0].tag).toBe('other');
    expect(result[0].cleanMessage).toBe('misc update');
    expect(result[0].scope).toBeNull();
  });
});

describe('KNOWN_TAGS', () => {
  it('includes common conventional commit types', () => {
    expect(KNOWN_TAGS).toContain('feat');
    expect(KNOWN_TAGS).toContain('fix');
    expect(KNOWN_TAGS).toContain('chore');
  });
});
