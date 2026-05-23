import { describe, it, expect, afterAll } from 'vitest';
import { exportMarkdown } from './markdownExporter.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

let tmpDir;

async function makeTmpDir() {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md-export-test-'));
  return tmpDir;
}

afterAll(async () => {
  if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true });
});

describe('exportMarkdown integration', () => {
  it('writes a real markdown file to disk', async () => {
    const dir = await makeTmpDir();
    const commits = [
      { repo: 'project-a', message: 'add feature X', hash: 'aaa0001', author: 'alice' },
      { repo: 'project-a', message: 'fix regression', hash: 'aaa0002', author: 'alice' },
      { repo: 'project-b', message: 'update deps', hash: 'bbb0001', author: 'alice' },
    ];

    const filePath = await exportMarkdown(commits, { outputDir: dir, since: '2024-06-10' });

    const content = await fs.readFile(filePath, 'utf-8');
    expect(content).toContain('# Git Standup');
    expect(content).toMatch(/###\s+project-a/);
    expect(content).toMatch(/###\s+project-b/);
    expect(content).toContain('add feature X');
    expect(content).toContain('update deps');
    expect(content.endsWith('\n')).toBe(true);
  });

  it('filename matches the since date', async () => {
    const dir = await makeTmpDir();
    const filePath = await exportMarkdown([], { outputDir: dir, since: '2024-01-15' });
    expect(path.basename(filePath)).toBe('standup-2024-01-15.md');
  });
});
