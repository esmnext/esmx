// Template generation, do not manually modify
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

// Point git directly at .husky/ so hooks in that directory (e.g. pre-commit)
// run without the husky v9 _/ wrapper, whose generated shim for every hook
// name gets killed by non-interactive environments and blocks commits.
try {
    await execAsync('git config core.hooksPath .husky');
} catch (error) {
    console.log('[33m[WARN][0m git not found, skipping hooks setup');
}
