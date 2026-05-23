const {
  deduplicateByHash,
  deduplicateByFingerprint,
  commitFingerprint,
  deduplicateCommits,
} = require('./commitDeduplicator');

const makeCommit = (hash, message, author = 'Alice') => ({ hash, message, author });

describe('commitFingerprint', () => {
  it('returns lowercase author::message string', () => {
    const c = makeCommit('abc', 'Fix bug', 'Alice');
    expect(commitFingerprint(c)).toBe('alice::fix bug');
  });

  it('trims whitespace', () => {
    const c = makeCommit('abc', '  Fix bug  ', '  Alice  ');
    expect(commitFingerprint(c)).toBe('alice::fix bug');
  });
});

describe('deduplicateByHash', () => {
  it('removes commits with duplicate hashes', () => {
    const commits = [
      makeCommit('aaa', 'feat: add login'),
      makeCommit('bbb', 'fix: typo'),
      makeCommit('aaa', 'feat: add login'),
    ];
    const result = deduplicateByHash(commits);
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.hash)).toEqual(['aaa', 'bbb']);
  });

  it('returns all commits when no duplicates', () => {
    const commits = [makeCommit('a1', 'msg1'), makeCommit('a2', 'msg2')];
    expect(deduplicateByHash(commits)).toHaveLength(2);
  });
});

describe('deduplicateByFingerprint', () => {
  it('removes commits with same author and message', () => {
    const commits = [
      makeCommit('aaa', 'fix: bug', 'Alice'),
      makeCommit('bbb', 'fix: bug', 'Alice'),
      makeCommit('ccc', 'fix: bug', 'Bob'),
    ];
    const result = deduplicateByFingerprint(commits);
    expect(result).toHaveLength(2);
  });

  it('keeps commits with same message but different authors', () => {
    const commits = [
      makeCommit('aaa', 'chore: update deps', 'Alice'),
      makeCommit('bbb', 'chore: update deps', 'Bob'),
    ];
    expect(deduplicateByFingerprint(commits)).toHaveLength(2);
  });
});

describe('deduplicateCommits', () => {
  it('defaults to hash strategy', () => {
    const commits = [makeCommit('x1', 'msg'), makeCommit('x1', 'msg')];
    expect(deduplicateCommits(commits)).toHaveLength(1);
  });

  it('uses fingerprint strategy when specified', () => {
    const commits = [
      makeCommit('x1', 'same msg', 'Alice'),
      makeCommit('x2', 'same msg', 'Alice'),
    ];
    expect(deduplicateCommits(commits, { strategy: 'fingerprint' })).toHaveLength(1);
  });

  it('uses both strategies when specified', () => {
    const commits = [
      makeCommit('x1', 'msg a', 'Alice'),
      makeCommit('x1', 'msg a', 'Alice'),
      makeCommit('x2', 'msg a', 'Alice'),
    ];
    expect(deduplicateCommits(commits, { strategy: 'both' })).toHaveLength(1);
  });

  it('returns empty array for non-array input', () => {
    expect(deduplicateCommits(null)).toEqual([]);
    expect(deduplicateCommits(undefined)).toEqual([]);
  });
});
