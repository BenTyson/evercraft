const path = require('path');

/**
 * Find test file for a given source file
 * If changing src/actions/payment.ts, run src/actions/payment.test.ts
 */
const findTestFile = (filename) => {
  // If it's already a test file, return it
  if (filename.includes('.test.')) {
    return `vitest run ${filename}`;
  }

  // Skip non-testable files
  if (
    filename.includes('.d.ts') ||
    filename.includes('.config.') ||
    filename.includes('node_modules') ||
    filename.includes('.next')
  ) {
    return null;
  }

  // Find corresponding test file
  const testFile = filename.replace(/\.(ts|tsx|js|jsx)$/, '.test.$1');
  const fs = require('fs');

  // Only run test if it exists
  if (fs.existsSync(testFile)) {
    return `vitest run ${testFile}`;
  }

  return null;
};

module.exports = {
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const commands = [];

    // Always run ESLint and Prettier
    commands.push(`eslint --fix ${filenames.join(' ')}`);
    commands.push(`prettier --write ${filenames.join(' ')}`);

    // Run tests for changed files
    const testCommands = filenames
      .map(findTestFile)
      .filter(Boolean)
      .filter((cmd, idx, arr) => arr.indexOf(cmd) === idx); // dedupe

    commands.push(...testCommands);

    return commands;
  },
  '*.{json,md,mdx,css,html,yml,yaml,scss}': ['prettier --write'],
};
