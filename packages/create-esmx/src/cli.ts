#!/usr/bin/env node

import { createProject } from './index';

createProject().catch((error) => {
    console.error('Error creating project:', error);
    process.exit(1);
});
