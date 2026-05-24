jest.mock('./config');

const { loadConfig, saveConfig } = require('./config');
const { handleGoalCommand, GOAL_CONFIG_KEY } = require('./goalCommand');

function makeCommit(date) {
  return { hash: 'abc', message: 'feat: thing', date };
}

beforeEach(() => {
  jest.clearAllMocks();
  loadConfig.mockReturnValue({});
  saveConfig.mockImplementation(() => {});
});

describe('handleGoalCommand', () => {
  it('prints goal report for today', () => {
    const commits = [makeCommit('2024-06-10T09:00:00')];
    const log = jest.fn();
    handleGoalCommand({ date: '2024-06-10' }, commits, { log });
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toContain('2024-06-10');
  });

  it('uses goal from config', () => {
    loadConfig.mockReturnValue({ [GOAL_CONFIG_KEY]: 3 });
    const commits = Array.from({ length: 3 }, () => makeCommit('2024-06-10T09:00:00'));
    const log = jest.fn();
    handleGoalCommand({ date: '2024-06-10' }, commits, { log });
    expect(log.mock.calls[0][0]).toContain('3 / 3');
    expect(log.mock.calls[0][0]).toContain('Daily goal met');
  });

  it('sets goal when --set is provided', () => {
    const log = jest.fn();
    handleGoalCommand({ set: '7' }, [], { log });
    expect(saveConfig).toHaveBeenCalledWith(expect.objectContaining({ [GOAL_CONFIG_KEY]: 7 }));
    expect(log.mock.calls[0][0]).toContain('set to 7');
  });

  it('shows error for invalid --set value', () => {
    const error = jest.fn();
    handleGoalCommand({ set: 'abc' }, [], { error });
    expect(error).toHaveBeenCalledWith(expect.stringContaining('positive integer'));
    expect(saveConfig).not.toHaveBeenCalled();
  });

  it('shows error for zero --set value', () => {
    const error = jest.fn();
    handleGoalCommand({ set: '0' }, [], { error });
    expect(error).toHaveBeenCalled();
  });

  it('defaults to goal of 5 when not in config', () => {
    const commits = Array.from({ length: 5 }, () => makeCommit('2024-06-10T09:00:00'));
    const log = jest.fn();
    handleGoalCommand({ date: '2024-06-10' }, commits, { log });
    expect(log.mock.calls[0][0]).toContain('5 / 5');
  });
});
