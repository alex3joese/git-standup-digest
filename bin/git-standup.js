#!/usr/bin/env node

import { run } from '../src/runner.js';

run(process.argv.slice(2)).catch((err) => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
