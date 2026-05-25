const {
  extractRefs,
  annotateCommitsWithRefs,
  buildRefSummary,
  formatRefSummary,
} = require('./commitRefSummary');

describe('extractRefs', () => {
  it('extracts GitHub-style issue refs', () => {
    expect(extractRefs('fix: resolve crash (#42)')).toEqual(['#42']);
  });

  it('extracts JIRA-style ticket refs', () => {
    expect(extractRefs('feat: add login PROJ-123')).toEqual(['PROJ-123']);
  });

  it('extracts multiple refs from one message', () => {
    const refs = extractRefs('fix #10 and #11 related to TEAM-99');
    expect(refs).toContain('#10');
    expect(refs).toContain('#11');
    expect(refs).toContain('TEAM-99');
  });

  it('deduplicates repeated refs', () => {
    const refs = extractRefs('fix #5, see #5');
    expect(refs).toEqual(['#5']);
  });

  it('returns empty array when no refs found', () => {
    expect(extractRefs('chore: update dependencies')).toEqual([]);
  });
});

describe('annotateCommitsWithRefs', () => {
  it('adds refs array to each commit', () => {
    const commits = [
      { message: 'fix crash (#7)', repo: 'api' },
      { message: 'chore: cleanup', repo: 'web' },
    ];
    const result = annotateCommitsWithRefs(commits);
    expect(result[0].refs).toEqual(['#7']);
    expect(result[1].refs).toEqual([]);
  });

  it('does not mutate original commits', () => {
    const commits = [{ message: 'fix #1' }];
    annotateCommitsWithRefs(commits);
    expect(commits[0].refs).toBeUndefined();
  });
});

describe('buildRefSummary', () => {
  it('groups commits by ref', () => {
    const commits = [
      { message: 'fix #3', refs: ['#3'], repo: 'core' },
      { message: 'also #3', refs: ['#3'], repo: 'core' },
      { message: 'feat PROJ-1', refs: ['PROJ-1'], repo: 'api' },
    ];
    const summary = buildRefSummary(commits);
    expect(summary['#3']).toHaveLength(2);
    expect(summary['PROJ-1']).toHaveLength(1);
  });

  it('returns empty object for commits with no refs', () => {
    const commits = [{ message: 'chore', refs: [] }];
    expect(buildRefSummary(commits)).toEqual({});
  });
});

describe('formatRefSummary', () => {
  it('returns fallback message when no refs', () => {
    expect(formatRefSummary({})).toBe('No issue or ticket references found.');
  });

  it('formats refs with commit details', () => {
    const summary = {
      '#5': [{ message: 'fix bug', repo: 'api' }],
    };
    const output = formatRefSummary(summary);
    expect(output).toContain('#5');
    expect(output).toContain('fix bug');
    expect(output).toContain('[api]');
    expect(output).toContain('1 commit');
  });

  it('uses plural for multiple commits', () => {
    const summary = {
      '#9': [
        { message: 'fix a', repo: 'x' },
        { message: 'fix b', repo: 'x' },
      ],
    };
    expect(formatRefSummary(summary)).toContain('2 commits');
  });
});
