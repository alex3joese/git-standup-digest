const fs = require('fs');
const path = require('path');
const os = require('os');
const { isGitRepo, scanForRepos, resolveRepoPaths } = require('./repoScanner');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'gs-test-'));
}

function makeRepo(base, name) {
  const dir = name ? path.join(base, name) : base;
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(path.join(dir, '.git'));
  return dir;
}

describe('isGitRepo', () => {
  it('returns true for a directory with .git folder', () => {
    const tmp = makeTmpDir();
    fs.mkdirSync(path.join(tmp, '.git'));
    expect(isGitRepo(tmp)).toBe(true);
    fs.rmSync(tmp, { recursive: true });
  });

  it('returns false for a plain directory', () => {
    const tmp = makeTmpDir();
    expect(isGitRepo(tmp)).toBe(false);
    fs.rmSync(tmp, { recursive: true });
  });

  it('returns false for a non-existent path', () => {
    expect(isGitRepo('/does/not/exist/xyz')).toBe(false);
  });
});

describe('scanForRepos', () => {
  it('finds repos in subdirectories', () => {
    const tmp = makeTmpDir();
    makeRepo(tmp, 'project-a');
    makeRepo(tmp, 'project-b');
    fs.mkdirSync(path.join(tmp, 'not-a-repo'));
    const repos = scanForRepos(tmp);
    expect(repos).toHaveLength(2);
    expect(repos.some(r => r.endsWith('project-a'))).toBe(true);
    expect(repos.some(r => r.endsWith('project-b'))).toBe(true);
    fs.rmSync(tmp, { recursive: true });
  });

  it('includes base dir if it is a repo', () => {
    const tmp = makeTmpDir();
    makeRepo(tmp);
    const repos = scanForRepos(tmp);
    expect(repos).toContain(path.resolve(tmp));
    fs.rmSync(tmp, { recursive: true });
  });

  it('returns empty array for non-existent dir', () => {
    expect(scanForRepos('/no/such/path')).toEqual([]);
  });

  it('skips hidden directories', () => {
    const tmp = makeTmpDir();
    makeRepo(tmp, '.hidden-repo');
    const repos = scanForRepos(tmp);
    expect(repos).toHaveLength(0);
    fs.rmSync(tmp, { recursive: true });
  });
});

describe('resolveRepoPaths', () => {
  it('deduplicates repos found in overlapping dirs', () => {
    const tmp = makeTmpDir();
    makeRepo(tmp, 'shared');
    const repos = resolveRepoPaths([tmp, tmp]);
    expect(repos.filter(r => r.endsWith('shared'))).toHaveLength(1);
    fs.rmSync(tmp, { recursive: true });
  });

  it('merges explicit paths with scanned dirs', () => {
    const tmp = makeTmpDir();
    makeRepo(tmp, 'auto-found');
    const explicit = makeRepo(makeTmpDir());
    const repos = resolveRepoPaths([tmp], [explicit]);
    expect(repos.some(r => r.endsWith('auto-found'))).toBe(true);
    expect(repos).toContain(path.resolve(explicit));
    fs.rmSync(tmp, { recursive: true });
    fs.rmSync(explicit, { recursive: true });
  });

  it('returns empty array when given no input', () => {
    expect(resolveRepoPaths()).toEqual([]);
  });
});
