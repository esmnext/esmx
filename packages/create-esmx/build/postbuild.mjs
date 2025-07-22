#!/usr/bin/env node

import fs from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cli } from '../dist/cli.mjs';
import { getAvailableTemplates } from '../dist/template.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function checkAndUpdateEntryNodeFile(projectPath) {
    const entryNodePath = join(projectPath, 'src/entry.node.ts');

    if (!fs.existsSync(entryNodePath)) {
        return;
    }

    const content = fs.readFileSync(entryNodePath, 'utf-8');

    // Check if postBuild function is already defined
    if (content.includes('async postBuild(')) {
        return;
    }

    // Find the position to insert postBuild function
    // We need to check specifically for the vue2-ssr template structure
    if (
        content.includes('async devApp(esmx)') &&
        content.includes('async server(esmx)')
    ) {
        // Insert postBuild between devApp and server functions
        const serverFunctionPos = content.indexOf('async server(esmx)');
        let insertPosition = content.lastIndexOf('},', serverFunctionPos);

        if (insertPosition > 0) {
            insertPosition += 2; // Move past the closing bracket and comma

            const postBuildFunction = `

    async postBuild(esmx) {
        const rc = await esmx.render();
        esmx.writeSync(esmx.resolvePath('dist/client', 'index.html'), rc.html);
    },`;

            // Insert the postBuild function
            const newContent =
                content.slice(0, insertPosition) +
                postBuildFunction +
                content.slice(insertPosition);

            // Write the updated content back to the file
            fs.writeFileSync(entryNodePath, newContent, 'utf-8');
            console.log(`Added postBuild function to ${entryNodePath}`);

            // Verify the addition was successful
            const updatedContent = fs.readFileSync(entryNodePath, 'utf-8');
            const verifySuccess = updatedContent.includes(
                'async postBuild(esmx)'
            );
            console.log(
                `Verification: postBuild function ${verifySuccess ? 'was successfully added' : 'failed to be added'}`
            );

            return verifySuccess;
        }
    }

    console.log(
        `Could not find appropriate position to add postBuild function in ${entryNodePath}`
    );
    return false;
}

async function exportTemplatesToExamplesDir() {
    const rootDir = resolve(__dirname, '../../..');
    const examplesTemplatesDir = join(rootDir, 'examples/templates');

    await mkdir(examplesTemplatesDir, { recursive: true });

    const templates = getAvailableTemplates();
    console.log(`Found ${templates.length} templates`);

    if (templates.length === 0) {
        console.warn('No templates found');
        return;
    }

    for (const template of templates) {
        const projectName = template.folder;
        const projectPath = join(examplesTemplatesDir, projectName);

        console.log(`Exporting template ${projectName} to ${projectPath}`);

        await cli({
            argv: [projectPath, '--template', template.folder, '--force'],
            cwd: rootDir,
            userAgent: 'npm/test',
            version: 'workspace:*'
        });

        // Check and update the entry.node.ts file if needed
        await checkAndUpdateEntryNodeFile(projectPath);

        console.log(`Template ${projectName} exported successfully`);
    }

    console.log('All templates exported to examples/templates directory');
}

exportTemplatesToExamplesDir();
