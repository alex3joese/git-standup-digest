const path = require('path');
const os = require('os');
const fs = require('fs');
const { handleGoalCommand } = require('./goalCommand');

// Use a real temp config file for integration
let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'goal-test-'));
  process.env.GIT_STANDUP_CONFIG = path.join(tmpDir, 'config.json');
});

afterEach(() => {
  delete process.env.GIT_STANDUP_CONFIG;
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function makeCommit(date, msg = 'feat: thing') {
  return { hash: Math.random().toString(36).slice(2), message: msg, date };
}

describe('goalCommand integration', () => {
  it('sets and reads back a custom goal', () => {
    const log = jest.fn();
    handleGoalCommand({ set: '4' }, [], { log });
    expect(log.mock.calls[0][0]).toContain('set to 4');

    const log2 = jest.fn();
    const commits = Array.from({ length: 4 }, () => makeCommit('2024-06-10T09:00:00'));
    handleGoalCommand({ date: '2024-06-10' }, commits, { log: log2 });
    expect(log2.mock.calls[0][0]).toContain('4 / 4');
    expect(log2.mock.calls[0][0]).toContain('Daily goal met');
  });

  it('shows progress when goal not met', () => {
    const log = jest.fn();
    handleGoalCommand({ set: '6' }, [], { log });

    const log2 = jest.fn();
    const commits = [makeCommit('2024-06-10T09:00:00'), makeCommit('2024-06-10T11:00:00')];
    handleGoalCommand({ date: '2024-06-10' }, commits, { log: log2 });
    const report = log2.mock.calls[0][0];
    expect(report).toContain('2 / 6');
    expect(report).toContain('4 more commit(s)');
  });
});
