/**
 * exportCommand.js
 * Handles the --export flag: renders the digest as markdown and writes it to a file.
 */

const path = require('path');
const { buildMarkdownFilename, toMarkdown } = require('./markdownExporter');
const { writeToFile } = require('./output');
const { buildTagSummary } = require('./tagSummary');
const { buildTimeline } = require('./commitTimeline');

/**
 * Build export options from CLI args and config.
 * @param {object} args - Parsed CLI arguments
 * @param {object} config - Loaded config values
 * @returns {object}
 */
function buildExportOptions(args, config) {
  const outputDir = args.outputDir || config.exportDir || process.cwd();
  const template = args.template || config.defaultTemplate || 'default';
  const includeTags = args.tags !== false && config.includeTags !== false;
  const includeTimeline = args.timeline !== false && config.includeTimeline !== false;
  return { outputDir, template, includeTags, includeTimeline };
}

/**
 * Enrich the digest data with optional sections (tags, timeline).
 * @param {object} digestData - Base digest data { repos, commits, dateRange }
 * @param {object} options
 * @returns {object}
 */
function enrichDigestForExport(digestData, options) {
  const enriched = { ...digestData };

  if (options.includeTags && digestData.commits && digestData.commits.length > 0) {
    enriched.tagSummary = buildTagSummary(digestData.commits);
  }

  if (options.includeTimeline && digestData.commits && digestData.commits.length > 0) {
    enriched.timeline = buildTimeline(digestData.commits);
  }

  return enriched;
}

/**
 * Resolve the full output file path.
 * @param {string} outputDir
 * @param {string|null} explicitFilename - User-supplied filename, if any
 * @param {object} dateRange - { since, until }
 * @returns {string}
 */
function resolveOutputPath(outputDir, explicitFilename, dateRange) {
  const filename = explicitFilename || buildMarkdownFilename(dateRange);
  return path.resolve(outputDir, filename);
}

/**
 * Handle the export command: convert digest to markdown and write to disk.
 * @param {object} digestData - { repos, commits, dateRange, author }
 * @param {object} args - Parsed CLI args
 * @param {object} config - App config
 * @returns {Promise<string>} - Resolves to the output file path
 */
async function handleExportCommand(digestData, args, config) {
  const options = buildExportOptions(args, config);
  const enriched = enrichDigestForExport(digestData, options);
  const outputPath = resolveOutputPath(
    options.outputDir,
    args.output || null,
    digestData.dateRange
  );

  const markdown = toMarkdown(enriched, options.template);
  await writeToFile(outputPath, markdown);

  return outputPath;
}

/**
 * Format a user-facing confirmation message after export.
 * @param {string} outputPath
 * @param {number} commitCount
 * @returns {string}
 */
function formatExportConfirmation(outputPath, commitCount) {
  return `✅ Exported ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${outputPath}`;
}

module.exports = {
  buildExportOptions,
  enrichDigestForExport,
  resolveOutputPath,
  handleExportCommand,
  formatExportConfirmation,
};
