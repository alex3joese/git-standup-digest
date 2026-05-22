/**
 * Integration tests: authorFilter working together with filterByAuthor
 * and resolveAuthorFilter to simulate the full filtering pipeline.
 */
const { filterByAuthor, resolveAuthorFilter } = require('./authorFilter');

const sampleCommits = [
  { author: 'Jane Doe', email: 'jane@corp.com', message: 'feat: add login', repo: 'api' },
  { author: 'John Smith', email: 'john@corp.com', message: 'fix: typo', repo: 'web' },
  { author: 'Jane Doe', email: 'jane@corp.com', message: 'refactor: cleanup', repo: 'api' },
  { author: 'Bot Runner', email: 'bot@ci.com', message: 'chore: bump deps', repo: 'infra' },
];

describe('author filter pipeline', () => {
  it('filters commits using resolved author from CLI arg', () => {
    const author = resolveAuthorFilter('jane', { defaultAuthor: 'john' });
    const result = filterByAuthor(sampleCommits, author);
    expect(result).toHaveLength(2);
    result.forEach((c) => expect(c.author).toBe('Jane Doe'));
  });

  it('filters commits using resolved author from config when no CLI arg', () => {
    const author = resolveAuthorFilter(null, { defaultAuthor: 'john' });
    const result = filterByAuthor(sampleCommits, author);
    expect(result).toHaveLength(1);
    expect(result[0].author).toBe('John Smith');
  });

  it('returns all commits when no author filter is set anywhere', () => {
    const author = resolveAuthorFilter(null, {});
    const result = filterByAuthor(sampleCommits, author);
    expect(result).toHaveLength(4);
  });

  it('can filter by email domain substring', () => {
    const author = resolveAuthorFilter('ci.com', null);
    const result = filterByAuthor(sampleCommits, author);
    expect(result).toHaveLength(1);
    expect(result[0].author).toBe('Bot Runner');
  });

  it('returns empty array when filter matches nobody', () => {
    const author = resolveAuthorFilter('nobody', {});
    const result = filterByAuthor(sampleCommits, author);
    expect(result).toHaveLength(0);
  });
});
