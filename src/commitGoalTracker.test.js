const {
  commitsOnDay,
  buildGoalSummary,
  renderGoalBar,
  formatGoalReport,
  DEFAULT_GOAL,
} = require('./commitGoalTracker');

const DAY = '2024-06-10';

function makeCommit(date, msg = 'fix: something') {
  return { hash: Math.random().toString(36).slice(2), message: msg, date };
}

describe('commitsOnDay', () => {
  it('returns only commits matching the date', () => {
    const commits = [
      makeCommit('2024-06-10T09:00:00'),
      makeCommit('2024-06-10T15:30:00'),
      makeCommit('2024-06-11T08:00:00'),
    ];
    expect(commitsOnDay(commits, DAY)).toHaveLength(2);
  });

  it('returns empty array when no commits match', () => {
    expect(commitsOnDay([makeCommit('2024-06-09T10:00:00')], DAY)).toHaveLength(0);
  });
});

describe('buildGoalSummary', () => {
  it('reports met=false when under goal', () => {
    const commits = [makeCommit('2024-06-10T09:00:00'), makeCommit('2024-06-10T10:00:00')];
    const summary = buildGoalSummary(commits, 5, DAY);
    expect(summary.count).toBe(2);
    expect(summary.goal).toBe(5);
    expect(summary.remaining).toBe(3);
    expect(summary.met).toBe(false);
    expect(summary.percent).toBe(40);
  });

  it('reports met=true when goal reached', () => {
    const commits = Array.from({ length: 5 }, () => makeCommit('2024-06-10T09:00:00'));
    const summary = buildGoalSummary(commits, 5, DAY);
    expect(summary.met).toBe(true);
    expect(summary.percent).toBe(100);
    expect(summary.remaining).toBe(0);
  });

  it('caps percent at 100 when exceeding goal', () => {
    const commits = Array.from({ length: 8 }, () => makeCommit('2024-06-10T09:00:00'));
    const summary = buildGoalSummary(commits, 5, DAY);
    expect(summary.percent).toBe(100);
  });

  it('uses DEFAULT_GOAL when none specified', () => {
    const summary = buildGoalSummary([], undefined, DAY);
    expect(summary.goal).toBe(DEFAULT_GOAL);
  });
});

describe('renderGoalBar', () => {
  it('renders a full bar at 100%', () => {
    const bar = renderGoalBar({ percent: 100 }, 10);
    expect(bar).toContain('██████████');
    expect(bar).toContain('100%');
  });

  it('renders empty bar at 0%', () => {
    const bar = renderGoalBar({ percent: 0 }, 10);
    expect(bar).toContain('░░░░░░░░░░');
  });
});

describe('formatGoalReport', () => {
  it('includes date and goal info', () => {
    const summary = buildGoalSummary([], 5, DAY);
    const report = formatGoalReport(summary);
    expect(report).toContain(DAY);
    expect(report).toContain('0 / 5');
    expect(report).toContain('5 more commit(s)');
  });

  it('shows success message when met', () => {
    const commits = Array.from({ length: 5 }, () => makeCommit('2024-06-10T09:00:00'));
    const summary = buildGoalSummary(commits, 5, DAY);
    expect(formatGoalReport(summary)).toContain('Daily goal met');
  });
});
