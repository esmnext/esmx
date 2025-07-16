#!/usr/bin/env node

import { cli } from './cli';

cli().catch((error) => {
    console.error('Error creating project:', error);
    process.exit(1);
});
