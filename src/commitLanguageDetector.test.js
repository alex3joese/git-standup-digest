const {
  extractExtension,
  detectLanguagesFromFiles,
  annotateCommitsWithLanguages,
  buildLanguageSummary,
  formatLanguageSummary,
} = require('./commitLanguageDetector');

describe('extractExtension', () => {
  it('returns the file extension in lowercase', () => {
    expect(extractExtension('index.JS')).toBe('js');
    expect(extractExtension('app.tsx')).toBe('tsx');
  });

  it('returns null for files without extension', () => {
    expect(extractExtension('Makefile')).toBeNull();
    expect(extractExtension('README')).toBeNull();
  });
});

describe('detectLanguagesFromFiles', () => {
  it('maps known extensions to language names', () => {
    const langs = detectLanguagesFromFiles(['src/index.js', 'src/app.ts']);
    expect(langs).toContain('JavaScript');
    expect(langs).toContain('TypeScript');
  });

  it('deduplicates languages', () => {
    const langs = detectLanguagesFromFiles(['a.js', 'b.js', 'c.jsx']);
    expect(langs.filter((l) => l === 'JavaScript').length).toBe(1);
  });

  it('ignores unknown extensions', () => {
    const langs = detectLanguagesFromFiles(['data.xyz', 'file.abc']);
    expect(langs).toHaveLength(0);
  });

  it('returns empty array for empty input', () => {
    expect(detectLanguagesFromFiles([])).toEqual([]);
  });
});

describe('annotateCommitsWithLanguages', () => {
  it('adds languages array to each commit', () => {
    const commits = [{ hash: 'abc', files: ['main.go', 'README.md'] }];
    const result = annotateCommitsWithLanguages(commits);
    expect(result[0].languages).toContain('Go');
    expect(result[0].languages).toContain('Markdown');
  });

  it('handles commits with no files', () => {
    const commits = [{ hash: 'def', files: [] }];
    const result = annotateCommitsWithLanguages(commits);
    expect(result[0].languages).toEqual([]);
  });
});

describe('buildLanguageSummary', () => {
  it('counts commits per language sorted by frequency', () => {
    const commits = [
      { files: ['a.js'] },
      { files: ['b.js'] },
      { files: ['c.py'] },
    ];
    const summary = buildLanguageSummary(commits);
    expect(summary[0]).toEqual({ lang: 'JavaScript', count: 2 });
    expect(summary[1]).toEqual({ lang: 'Python', count: 1 });
  });

  it('returns empty array when no languages detected', () => {
    expect(buildLanguageSummary([{ files: [] }])).toEqual([]);
  });
});

describe('formatLanguageSummary', () => {
  it('formats summary lines correctly', () => {
    const summary = [{ lang: 'JavaScript', count: 3 }, { lang: 'Go', count: 1 }];
    const output = formatLanguageSummary(summary);
    expect(output).toContain('JavaScript: 3 commits');
    expect(output).toContain('Go: 1 commit');
  });

  it('returns fallback message for empty summary', () => {
    expect(formatLanguageSummary([])).toBe('No languages detected.');
  });
});
