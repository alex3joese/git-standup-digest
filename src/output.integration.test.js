/**
 * Integration test: outputDigest works end-to-end with a real formatted digest
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { formatDigest } = require('./formatDigest');
const { outputDigest } = require('./output');

const SAMPLE_COMMITS = [
  { repo: 'my-app', hash: 'abc1234', message: 'fix: resolve login bug', date: '2024-06-10' },
  { repo: 'my-app', hash: 'def5678', message: 'feat: add dark mode', date: '2024-06-10' },
  { repo: 'api-server', hash: 'aaa0001', message: 'chore: update deps', date: '2024-06-10' },
];

describe('output integration', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'digest-integration-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('formats and writes digest to file', () => {
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => {});
    const digest = formatDigest(SAMPLE_COMMITS, { date: '2024-06-10' });
    const outPath = path.join(tmpDir, 'standup.md');

    const result = outputDigest(digest, { outputFile: outPath });

    expect(result.wroteFile).toBe(true);
    const written = fs.readFileSync(outPath, 'utf8');
    expect(written).toContain('my-app');
    expect(written).toContain('api-server');
    expect(written).toContain('fix: resolve login bug');
    expect(written).toContain('chore: update deps');
    stderrSpy.mockRestore();
  });

  it('formats and prints digest to stdout', () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
    const digest = formatDigest(SAMPLE_COMMITS, { date: '2024-06-10' });

    const result = outputDigest(digest);

    expect(result.wroteFile).toBe(false);
    expect(stdoutSpy).toHaveBeenCalled();
    const output = stdoutSpy.mock.calls[0][0];
    expect(output).toContain('feat: add dark mode');
    stdoutSpy.mockRestore();
  });
});
