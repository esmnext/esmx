#!/usr/bin/env node --no-warnings --experimental-vm-modules --experimental-import-meta-resolve --experimental-strip-types
import { styleText } from 'node:util';
import pkg from '../../package.json' with { type: 'json' };
import { cli } from './cli';

console.log(`🔥 ${styleText('yellow', 'Esmx')} v${pkg.version}
`);

cli(process.argv.slice(2)[0] || '');
