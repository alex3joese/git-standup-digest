'use strict';

const {
  buildHeatmapGrid,
  maxGridValue,
  heatChar,
  renderHeatmap,
  DAYS,
} = require('./commitHeatmap');

function makeCommit(dateStr) {
  return { hash: 'abc', message: 'test', date: dateStr, repo: 'repo' };
}

describe('buildHeatmapGrid', () => {
  it('counts commits by day:hour key', () => {
    // 2024-01-01 is a Monday (day=1), 14:00
    const commits = [makeCommit('2024-01-01T14:00:00'), makeCommit('2024-01-01T14:30:00')];
    const grid = buildHeatmapGrid(commits);
    expect(grid['1:14']).toBe(2);
  });

  it('ignores commits with invalid dates', () => {
    const commits = [makeCommit('not-a-date')];
    const grid = buildHeatmapGrid(commits);
    expect(Object.keys(grid)).toHaveLength(0);
  });

  it('returns empty object for empty input', () => {
    expect(buildHeatmapGrid([])).toEqual({});
  });
});

describe('maxGridValue', () => {
  it('returns max value in grid', () => {
    expect(maxGridValue({ '1:9': 3, '2:10': 7, '3:11': 1 })).toBe(7);
  });

  it('returns 1 for empty grid', () => {
    expect(maxGridValue({})).toBe(1);
  });
});

describe('heatChar', () => {
  it('returns space for zero count', () => {
    expect(heatChar(0, 10)).toBe(' ');
  });

  it('returns full block for max count', () => {
    expect(heatChar(10, 10)).toBe('█');
  });

  it('returns intermediate chars for mid values', () => {
    const ch = heatChar(5, 10);
    expect(['░', '▒', '▓'].includes(ch)).toBe(true);
  });
});

describe('renderHeatmap', () => {
  it('renders a string with all day labels', () => {
    const commits = [makeCommit('2024-01-03T09:00:00')];
    const output = renderHeatmap(commits);
    for (const day of DAYS) {
      expect(output).toContain(day);
    }
  });

  it('renders 8 lines (header + 7 days)', () => {
    const lines = renderHeatmap([]).split('\n');
    expect(lines).toHaveLength(8);
  });

  it('handles empty commits gracefully', () => {
    expect(() => renderHeatmap([])).not.toThrow();
  });
});
