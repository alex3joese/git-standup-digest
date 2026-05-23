import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { getCommitDiffStat, annotateCommitsWithDiffStat } from './diffStat.js';

let tmpDir;
let commitHash;

beforeAll(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'diffstat-test-'));
  execSync('git init', { cwd: tmpDir });
  execSync('git config user.email "test@test.com"', { cwd: tmpDir });
  execSync('git config user.name "Test User"', { cwd: tmpDir });

  writeFileSync(join(tmpDir, 'hello.txt'), 'line1\nline2\nline3\n');
  execSync('git add .', { cwd: tmpDir });
  execSync('git commit -m "initial commit"', { cwd: tmpDir });

  writeFileSync(join(tmpDir, 'hello.txt'), 'line1\nline2\nline3\nline4\n');
  writeFileSync(join(tmpDir, 'other.txt'), 'new file\n');
  execSync('git add .', { cwd: tmpDir });
  execSync('git commit -m "add lines"', { cwd: tmpDir });

  commitHash = execSync('git rev-parse HEAD', { cwd: tmpDir }).toString().trim();
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('getCommitDiffStat integration', () => {
  it('returns diffstat for a real commit', async () => {
    const stat = await getCommitDiffStat(tmpDir, commitHash);
    expect(stat).toBeDefined();
    expect(stat.filesChanged).toBeGreaterThanOrEqual(1);
    expect(stat.insertions).toBeGreaterThanOrEqual(1);
  });

  it('returns zeros for unknown hash', async () => {
    const stat = await getCommitDiffStat(tmpDir, 'deadbeef1234');
    expect(stat.filesChanged).toBe(0);
    expect(stat.insertions).toBe(0);
    expect(stat.deletions).toBe(0);
  });
});

describe('annotateCommitsWithDiffStat integration', () => {
  it('annotates commits with real diff stats', async () => {
    const commits = [{ repo: tmpDir, hash: commitHash, message: 'add lines' }];
    const annotated = await annotateCommitsWithDiffStat(commits);
    expect(annotated[0].diffStat).toBeDefined();
    expect(annotated[0].diffStat.filesChanged).toBeGreaterThanOrEqual(1);
  });

  it('handles empty commit list', async () => {
    const result = await annotateCommitsWithDiffStat([]);
    expect(result).toEqual([]);
  });
});
