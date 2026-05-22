/**
 * templateRenderer.js
 * Renders digest output using simple named templates (default, markdown, slack)
 */

const TEMPLATES = {
  default: {
    header: (date) => `=== Standup Digest: ${date} ===\n`,
    repoHeader: (repo) => `\n[${repo}]`,
    commitLine: (line) => `  ${line}`,
    footer: () => '',
  },
  markdown: {
    header: (date) => `# Standup Digest: ${date}\n`,
    repoHeader: (repo) => `\n## ${repo}`,
    commitLine: (line) => `- ${line}`,
    footer: () => '',
  },
  slack: {
    header: (date) => `:memo: *Standup Digest: ${date}*\n`,
    repoHeader: (repo) => `\n*${repo}*`,
    commitLine: (line) => `  • ${line}`,
    footer: () => '',
  },
};

const VALID_TEMPLATES = Object.keys(TEMPLATES);

/**
 * Returns true if the given template name is supported.
 * @param {string} name
 * @returns {boolean}
 */
function isValidTemplate(name) {
  return VALID_TEMPLATES.includes(name);
}

/**
 * Renders a grouped digest object using the named template.
 * @param {{ date: string, repos: { repo: string, commits: string[] }[] }} digest
 * @param {string} templateName
 * @returns {string}
 */
function renderTemplate(digest, templateName = 'default') {
  const tpl = TEMPLATES[templateName] || TEMPLATES.default;
  const lines = [];

  lines.push(tpl.header(digest.date));

  for (const { repo, commits } of digest.repos) {
    lines.push(tpl.repoHeader(repo));
    for (const commit of commits) {
      lines.push(tpl.commitLine(commit));
    }
  }

  const footer = tpl.footer();
  if (footer) lines.push(footer);

  return lines.join('\n');
}

module.exports = { renderTemplate, isValidTemplate, VALID_TEMPLATES };
