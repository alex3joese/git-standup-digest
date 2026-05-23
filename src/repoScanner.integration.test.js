const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { scanForRepos, resolveRepoPaths } = require('./repoScanner');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'gs-integration-'));
}

function initGitRepo(dir, name) {
  const repoPath = path.join(dir, name);
  fs.mkdirSync(repoPath, { recursive: true });
  execSync('git init', { cwd: repoPath, stdio: 'ignore' });
  return repoPath;
}

/**
 * Cleans up a list of temporary directories created during a test.
 * Useful when a test creates extra tmp dirs beyond the main workspace.
 */
function cleanupDirs(...dirs) {
  for (const dir of dirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('repoScanner integration', () => {
  let workspace;

  beforeEach(() => {
    workspace = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(workspace, { recursive: true, force: true });
  });

  it('scans a workspace with real git repos', () => {
    initGitRepo(workspace, 'alpha');
    initGitRepo(workspace, 'beta');
    fs.mkdirSync(path.join(workspace, 'docs'));

    const repos = scanForRepos(workspace);
    expect(repos.length).toBe(2);
    expect(repos.some(r => r.endsWith('alpha'))).toBe(true);
    expect(repos.some(r => r.endsWith('beta'))).toBe(true);
  });

  it('resolveRepoPaths combines multiple scan dirs without duplicates', () => {
    const repoA = initGitRepo(workspace, 'repo-a');
    const repoB = initGitRepo(workspace, 'repo-b');

    const second = makeTmpDir();
    const repoC = initGitRepo(second, 'repo-c');

    const repos = resolveRepoPaths([workspace, second]);
    expect(repos.length).toBe(3);
    expect(repos).toContain(path.resolve(repoA));
    expect(repos).toContain(path.resolve(repoB));
    expect(repos).toContain(path.resolve(repoC));

    cleanupDirs(second);
  });

  it('explicit repo paths are included even outside scan dirs', () => {
    const standalone = makeTmpDir();
    execSync('git init', { cwd: standalone, stdio: 'ignore' });

    const repos = resolveRepoPaths([workspace], [standalone]);
    expect(repos).toContain(path.resolve(standalone));

    cleanupDirs(standalone);
  });
});
