#!/usr/bin/env node --no-warnings --experimental-vm-modules --experimental-import-meta-resolve --experimental-strip-types
import { enableCompileCache } from 'node:module';

try {
    enableCompileCache();
} catch {
    // ignore errors
}
import { cli } from './cli';

cli(process.argv.slice(2)[0] || '');
