const { earnedBadges, formatBadges, isNightOwl, isEarlyBird, isProlific, isFixer, isShipper } = require('./commitBadges');

function makeCommit(overrides = {}) {
  return { hash: 'abc123', message: 'chore: update deps', date: '2024-01-15T10:00:00Z', author: 'Dev', repo: 'myrepo', ...overrides };
}

describe('isNightOwl', () => {
  it('returns true when a commit is between midnight and 3am', () => {
    const commits = [makeCommit({ date: '2024-01-15T01:30:00' })];
    expect(isNightOwl(commits)).toBe(true);
  });
  it('returns false when no commits in that range', () => {
    const commits = [makeCommit({ date: '2024-01-15T09:00:00' })];
    expect(isNightOwl(commits)).toBe(false);
  });
});

describe('isEarlyBird', () => {
  it('returns true for a commit at 5am', () => {
    const commits = [makeCommit({ date: '2024-01-15T05:00:00' })];
    expect(isEarlyBird(commits)).toBe(true);
  });
  it('returns false at 9am', () => {
    const commits = [makeCommit({ date: '2024-01-15T09:00:00' })];
    expect(isEarlyBird(commits)).toBe(false);
  });
});

describe('isProlific', () => {
  it('returns true for 10+ commits', () => {
    const commits = Array.from({ length: 10 }, () => makeCommit());
    expect(isProlific(commits)).toBe(true);
  });
  it('returns false for fewer than 10', () => {
    expect(isProlific([makeCommit(), makeCommit()])).toBe(false);
  });
});

describe('isFixer', () => {
  it('returns true when majority are fixes', () => {
    const commits = [
      makeCommit({ message: 'fix: null pointer' }),
      makeCommit({ message: 'fix: crash on load' }),
      makeCommit({ message: 'feat: new button' }),
    ];
    expect(isFixer(commits)).toBe(true);
  });
  it('returns false when few fixes', () => {
    const commits = [makeCommit(), makeCommit(), makeCommit({ message: 'fix: typo' })];
    expect(isFixer(commits)).toBe(false);
  });
});

describe('isShipper', () => {
  it('detects release commits', () => {
    expect(isShipper([makeCommit({ message: 'chore: release v1.2.0' })])).toBe(true);
  });
  it('returns false with no release', () => {
    expect(isShipper([makeCommit()])).toBe(false);
  });
});

describe('earnedBadges', () => {
  it('returns empty array for ordinary commits', () => {
    const commits = [makeCommit()];
    expect(earnedBadges(commits, 0)).toEqual([]);
  });
  it('returns streaker badge for 7+ day streak', () => {
    const badges = earnedBadges([makeCommit()], 7);
    expect(badges.some(b => b.label.includes('Streaker'))).toBe(true);
  });
  it('returns multiple badges when applicable', () => {
    const commits = [
      makeCommit({ message: 'chore: release v2.0', date: '2024-01-15T02:00:00' }),
      ...Array.from({ length: 9 }, () => makeCommit()),
    ];
    const badges = earnedBadges(commits, 0);
    expect(badges.length).toBeGreaterThan(1);
  });
});

describe('formatBadges', () => {
  it('shows fallback when no badges', () => {
    expect(formatBadges([])).toContain('no badges');
  });
  it('formats badge lines', () => {
    const { BADGES } = require('./commitBadges');
    const result = formatBadges([BADGES.prolific]);
    expect(result).toContain('Prolific');
  });
});
