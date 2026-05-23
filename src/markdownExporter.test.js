import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildMarkdownFilename, toMarkdown, exportMarkdown } from './markdownExporter.js';

vi.mock('./output.js', () => ({
  writeToFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./formatDigest.js', () => ({
  formatDigest: vi.fn(() => 'my-repo:\n  - abc1234 fix a bug\n'),
}));

import { writeToFile } from './output.js';

describe('buildMarkdownFilename', () => {
  it('uses provided date string', () => {
    const filename = buildMarkdownFilename('2024-06-10');
    expect(filename).toBe('standup-2024-06-10.md');
  });

  it('falls back to today when no date given', () => {
    const filename = buildMarkdownFilename(null);
    const today = new Date().toISOString().slice(0, 10);
    expect(filename).toBe(`standup-${today}.md`);
  });
});

describe('toMarkdown', () => {
  it('wraps digest in a markdown document', () => {
    const result = toMarkdown('my-repo:\n  - abc1234 fix a bug\n', { since: '2024-06-10' });
    expect(result).toContain('# Git Standup');
    expect(result).toContain('### my-repo');
    expect(result).toContain('  - abc1234 fix a bug');
  });

  it('uses custom title when provided', () => {
    const result = toMarkdown('some-repo:\n', { title: 'My Custom Title' });
    expect(result).toContain('# My Custom Title');
  });

  it('does not double-convert list items', () => {
    const result = toMarkdown('  - already a list item\n');
    expect(result).toContain('  - already a list item');
    expect(result).not.toContain('###   - already a list item');
  });
});

describe('exportMarkdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('writes a markdown file and returns the path', async () => {
    const filePath = await exportMarkdown([{ repo: 'my-repo', message: 'fix bug', hash: 'abc1234' }], {
      outputDir: '/tmp',
      since: '2024-06-10',
    });
    expect(filePath).toBe('/tmp/standup-2024-06-10.md');
    expect(writeToFile).toHaveBeenCalledWith('/tmp/standup-2024-06-10.md', expect.stringContaining('# Git Standup'));
  });

  it('defaults outputDir to current directory', async () => {
    const filePath = await exportMarkdown([], { since: '2024-06-10' });
    expect(filePath).toBe('./standup-2024-06-10.md');
  });
});
