const {
  tokenize,
  buildWordFrequency,
  topWords,
  renderWordCloud,
  buildWordCloud,
} = require('./commitWordCloud');

const makeCommit = (message) => ({ message, hash: 'abc123', repo: 'repo' });

describe('tokenize', () => {
  it('lowercases and splits words', () => {
    expect(tokenize('Fix Bug In Auth')).toEqual(['fix', 'bug', 'auth']);
  });

  it('removes stop words', () => {
    expect(tokenize('add the new feature')).toEqual(['add', 'new', 'feature']);
  });

  it('removes short words', () => {
    expect(tokenize('do it now')).toEqual(['now']);
  });

  it('strips punctuation', () => {
    expect(tokenize('fix: broken login!')).toEqual(['fix', 'broken', 'login']);
  });
});

describe('buildWordFrequency', () => {
  it('counts word occurrences across commits', () => {
    const commits = [
      makeCommit('fix login bug'),
      makeCommit('fix signup bug'),
      makeCommit('refactor login flow'),
    ];
    const freq = buildWordFrequency(commits);
    expect(freq['fix']).toBe(2);
    expect(freq['login']).toBe(2);
    expect(freq['bug']).toBe(2);
    expect(freq['refactor']).toBe(1);
  });

  it('returns empty object for empty commits', () => {
    expect(buildWordFrequency([])).toEqual({});
  });
});

describe('topWords', () => {
  it('returns words sorted by frequency', () => {
    const freq = { fix: 5, refactor: 3, add: 7 };
    const result = topWords(freq, 2);
    expect(result[0].word).toBe('add');
    expect(result[1].word).toBe('fix');
    expect(result.length).toBe(2);
  });
});

describe('renderWordCloud', () => {
  it('renders a bar chart string', () => {
    const words = [{ word: 'fix', count: 10 }, { word: 'add', count: 5 }];
    const output = renderWordCloud(words);
    expect(output).toContain('fix');
    expect(output).toContain('add');
    expect(output).toContain('█');
  });

  it('returns (no data) for empty input', () => {
    expect(renderWordCloud([])).toBe('(no data)');
  });
});

describe('buildWordCloud', () => {
  it('returns words and rendered string', () => {
    const commits = [makeCommit('refactor auth module'), makeCommit('refactor login module')];
    const result = buildWordCloud(commits);
    expect(result.words.length).toBeGreaterThan(0);
    expect(typeof result.rendered).toBe('string');
  });
});
