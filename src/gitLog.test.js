const { getCommits } = require('./gitLog');
const { execSync } = require('child_process');

jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

describe('getCommits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('parses commits correctly from git output', () => {
    execSync.mockReturnValue(
      '"abc123|2024-05-01|fix login bug"\n"def456|2024-05-01|add unit tests"'
    );

    const commits = getCommits('/fake/repo/my-app');

    expect(commits).toHaveLength(2);
    expect(commits[0]).toEqual({
      hash: 'abc123',
      date: '2024-05-01',
      message: 'fix login bug',
      repo: 'my-app'
    });
    expect(commits[1].message).toBe('add unit tests');
  });

  test('returns empty array when git output is empty', () => {
    execSync.mockReturnValue('');
    const commits = getCommits('/fake/repo/empty-project');
    expect(commits).toEqual([]);
  });

  test('returns empty array when execSync throws', () => {
    execSync.mockImplementation(() => { throw new Error('not a git repo'); });
    const commits = getCommits('/not/a/repo');
    expect(commits).toEqual([]);
  });

  test('uses repo directory name as repo field', () => {
    execSync.mockReturnValue('"aaa111|2024-05-01|initial commit"');
    const commits = getCommits('/home/user/projects/cool-lib');
    expect(commits[0].repo).toBe('cool-lib');
  });

  test('passes author flag when author is provided', () => {
    execSync.mockReturnValue('');
    getCommits('/fake/repo', '1 day ago', 'Jane Doe');
    const calledCmd = execSync.mock.calls[0][0];
    expect(calledCmd).toContain('--author="Jane Doe"');
  });

  test('does not include author flag when author is null', () => {
    execSync.mockReturnValue('');
    getCommits('/fake/repo', '1 day ago', null);
    const calledCmd = execSync.mock.calls[0][0];
    expect(calledCmd).not.toContain('--author');
  });
});
