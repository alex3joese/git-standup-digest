// Detects programming languages touched by commits based on file extensions in diff stats

const EXTENSION_MAP = {
  js: 'JavaScript',
  ts: 'TypeScript',
  jsx: 'JavaScript',
  tsx: 'TypeScript',
  py: 'Python',
  rb: 'Ruby',
  go: 'Go',
  rs: 'Rust',
  java: 'Java',
  cs: 'C#',
  cpp: 'C++',
  c: 'C',
  php: 'PHP',
  swift: 'Swift',
  kt: 'Kotlin',
  md: 'Markdown',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  css: 'CSS',
  scss: 'SCSS',
  html: 'HTML',
  sh: 'Shell',
};

function extractExtension(filename) {
  const parts = filename.split('.');
  if (parts.length < 2) return null;
  return parts[parts.length - 1].toLowerCase();
}

function detectLanguagesFromFiles(files) {
  const langs = new Set();
  for (const file of files) {
    const ext = extractExtension(file);
    if (ext && EXTENSION_MAP[ext]) {
      langs.add(EXTENSION_MAP[ext]);
    }
  }
  return Array.from(langs);
}

function annotateCommitsWithLanguages(commits) {
  return commits.map((commit) => {
    const files = commit.files || [];
    const languages = detectLanguagesFromFiles(files);
    return { ...commit, languages };
  });
}

function buildLanguageSummary(commits) {
  const freq = {};
  for (const commit of commits) {
    const langs = commit.languages || detectLanguagesFromFiles(commit.files || []);
    for (const lang of langs) {
      freq[lang] = (freq[lang] || 0) + 1;
    }
  }
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted.map(([lang, count]) => ({ lang, count }));
}

function formatLanguageSummary(summary) {
  if (!summary.length) return 'No languages detected.';
  return summary.map(({ lang, count }) => `  ${lang}: ${count} commit${count !== 1 ? 's' : ''}`).join('\n');
}

module.exports = {
  extractExtension,
  detectLanguagesFromFiles,
  annotateCommitsWithLanguages,
  buildLanguageSummary,
  formatLanguageSummary,
};
