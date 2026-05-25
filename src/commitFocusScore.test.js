const {
  countTypes,
  computeFocusScore,
  focusLabel,
  buildFocusSummary,
} = require('./commitFocusScore');

const makeCommit = (message) => ({ message, hash: 'abc', author: 'dev', date: new Date().toISOString() });

describe('countTypes', () => {
  it('counts conventional commit types', () => {
    const commits = [
      makeCommit('feat: add login'),
      makeCommit('feat: add signup'),
      makeCommit('fix: fix crash'),
    ];
    const counts = countTypes(commits);
    expect(counts.feat).toBe(2);
    expect(counts.fix).toBe(1);
  });

  it('groups non-conventional commits as other', () => {
    const commits = [makeCommit('random message'), makeCommit('another one')];
    const counts = countTypes(commits);
    expect(counts.other).toBe(2);
  });
});

describe('computeFocusScore', () => {
  it('returns 100 when all commits are the same type', () => {
    const commits = [
      makeCommit('feat: a'),
      makeCommit('feat: b'),
      makeCommit('feat: c'),
    ];
    expect(computeFocusScore(commits)).toBe(100);
  });

  it('returns lower score for mixed commits', () => {
    const commits = [
      makeCommit('feat: a'),
      makeCommit('fix: b'),
      makeCommit('chore: c'),
      makeCommit('docs: d'),
    ];
    const score = computeFocusScore(commits);
    expect(score).toBe(25);
  });

  it('returns 0 for empty array', () => {
    expect(computeFocusScore([])).toBe(0);
  });

  it('returns 0 for null/undefined', () => {
    expect(computeFocusScore(null)).toBe(0);
  });
});

describe('focusLabel', () => {
  it('labels 90 as Highly Focused', () => expect(focusLabel(90)).toBe('Highly Focused'));
  it('labels 60 as Moderately Focused', () => expect(focusLabel(60)).toBe('Moderately Focused'));
  it('labels 40 as Mixed', () => expect(focusLabel(40)).toBe('Mixed'));
  it('labels 20 as Scattered', () => expect(focusLabel(20)).toBe('Scattered'));
});

describe('buildFocusSummary', () => {
  it('returns score, label, and typeCounts', () => {
    const commits = [makeCommit('feat: x'), makeCommit('feat: y'), makeCommit('fix: z')];
    const summary = buildFocusSummary(commits);
    expect(summary).toHaveProperty('score');
    expect(summary).toHaveProperty('label');
    expect(summary).toHaveProperty('typeCounts');
    expect(summary.typeCounts.feat).toBe(2);
  });
});
