// Runs on staged files only, from the Husky pre-commit hook.
// The globs don't overlap, so two tools never edit the same file at once.
export default {
  // tsc checks the whole project, so it ignores the file list and runs once.
  '*.ts': ['eslint --fix', 'prettier --write', () => 'tsc --noEmit'],
  '*.{js,mjs,cjs}': ['eslint --fix', 'prettier --write'],
  '!(*.{ts,js,mjs,cjs})': 'prettier --write --ignore-unknown',
};
