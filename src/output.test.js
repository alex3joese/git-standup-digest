const fs = require('fs');
const path = require('path');
const os = require('os');
const { outputDigest, writeToFile, printToStdout } = require('./output');

describe('writeToFile', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'digest-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes content to a file', () => {
    const filePath = path.join(tmpDir, 'digest.md');
    writeToFile(filePath, 'hello world');
    expect(fs.readFileSync(filePath, 'utf8')).toBe('hello world');
  });

  it('creates intermediate directories', () => {
    const filePath = path.join(tmpDir, 'nested', 'deep', 'digest.md');
    writeToFile(filePath, 'nested content');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('returns the resolved file path', () => {
    const filePath = path.join(tmpDir, 'out.md');
    const result = writeToFile(filePath, 'data');
    expect(result).toBe(path.resolve(filePath));
  });
});

describe('printToStdout', () => {
  it('writes content to stdout', () => {
    const spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
    printToStdout('test output');
    expect(spy).toHaveBeenCalledWith('test output\n');
    spy.mockRestore();
  });
});

describe('outputDigest', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'digest-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('prints to stdout when no outputFile given', () => {
    const spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
    const result = outputDigest('some digest');
    expect(spy).toHaveBeenCalledWith('some digest\n');
    expect(result).toEqual({ wroteFile: false, filePath: null });
    spy.mockRestore();
  });

  it('writes to file when outputFile is given', () => {
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => {});
    const filePath = path.join(tmpDir, 'out.md');
    const result = outputDigest('file content', { outputFile: filePath });
    expect(result.wroteFile).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toBe('file content');
    stderrSpy.mockRestore();
  });

  it('suppresses stderr message when silent is true', () => {
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => {});
    const filePath = path.join(tmpDir, 'silent.md');
    outputDigest('content', { outputFile: filePath, silent: true });
    expect(stderrSpy).not.toHaveBeenCalled();
    stderrSpy.mockRestore();
  });
});
