import { formatDigest } from './formatDigest.js';
import { writeToFile } from './output.js';
import path from 'path';

/**
 * Builds a markdown filename based on the date range.
 * @param {string} since - ISO or git date string
 * @returns {string}
 */
export function buildMarkdownFilename(since) {
  const date = since ? new Date(since) : new Date();
  const dateStr = date.toISOString().slice(0, 10);
  return `standup-${dateStr}.md`;
}

/**
 * Converts a digest string into a markdown document.
 * @param {string} digest - Plain text digest
 * @param {object} options
 * @param {string} [options.title] - Optional title override
 * @param {string} [options.since] - Date used to generate the digest
 * @returns {string}
 */
export function toMarkdown(digest, { title, since } = {}) {
  const dateLabel = since
    ? new Date(since).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const heading = title || `Git Standup — ${dateLabel}`;
  const lines = digest.split('\n');

  const markdownLines = lines.map((line) => {
    if (line.startsWith('  -')) {
      return line; // already a list item
    }
    if (line.endsWith(':') && !line.startsWith(' ')) {
      return `### ${line.slice(0, -1)}`;
    }
    return line;
  });

  return `# ${heading}\n\n${markdownLines.join('\n')}\n`;
}

/**
 * Exports the digest as a markdown file.
 * @param {object[]} commits
 * @param {object} options
 * @param {string} options.outputDir - Directory to write the file
 * @param {string} [options.since]
 * @param {string} [options.title]
 * @returns {Promise<string>} - Resolved file path
 */
export async function exportMarkdown(commits, { outputDir = '.', since, title } = {}) {
  const digest = formatDigest(commits);
  const markdown = toMarkdown(digest, { title, since });
  const filename = buildMarkdownFilename(since);
  const filePath = path.join(outputDir, filename);
  await writeToFile(filePath, markdown);
  return filePath;
}
