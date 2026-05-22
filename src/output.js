/**
 * output.js — handles writing the digest to stdout or a file
 */

const fs = require('fs');
const path = require('path');

/**
 * Write content to a file, creating directories if needed.
 * @param {string} filePath
 * @param {string} content
 */
function writeToFile(filePath, content) {
  const resolved = path.resolve(filePath);
  const dir = path.dirname(resolved);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(resolved, content, 'utf8');
  return resolved;
}

/**
 * Print content to stdout.
 * @param {string} content
 */
function printToStdout(content) {
  process.stdout.write(content + '\n');
}

/**
 * Output the digest either to a file or stdout.
 * @param {string} content - The formatted digest string
 * @param {object} options
 * @param {string} [options.outputFile] - If provided, write to this file path
 * @param {boolean} [options.silent] - Suppress stdout when writing to file
 * @returns {{ wroteFile: boolean, filePath: string|null }}
 */
function outputDigest(content, options = {}) {
  const { outputFile, silent = false } = options;

  if (outputFile) {
    const filePath = writeToFile(outputFile, content);
    if (!silent) {
      process.stderr.write(`Digest written to ${filePath}\n`);
    }
    return { wroteFile: true, filePath };
  }

  printToStdout(content);
  return { wroteFile: false, filePath: null };
}

module.exports = { outputDigest, writeToFile, printToStdout };
