import { existsSync, mkdirSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cancel, confirm, isCancel } from '@clack/prompts';
import { copyTemplateFiles, isDirectoryEmpty } from './template';
import type { TemplateVariables } from './types';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Create a project from template
 */
export async function createProjectFromTemplate(
    targetDir: string,
    templateType: string,
    workingDir: string,
    force: boolean,
    variables: TemplateVariables
): Promise<void> {
    const templatePath = resolve(__dirname, '../template', templateType);
    const targetPath = isAbsolute(targetDir)
        ? targetDir
        : targetDir === '.'
          ? workingDir
          : resolve(workingDir, targetDir);

    if (!existsSync(templatePath)) {
        throw new Error(`Template "${templateType}" not found`);
    }

    // Handle directory existence and overwrite confirmation
    if (targetDir !== '.' && existsSync(targetPath)) {
        if (!isDirectoryEmpty(targetPath)) {
            if (!force) {
                const shouldOverwrite = await confirm({
                    message: `Directory "${targetDir}" is not empty. Do you want to overwrite it?`
                });

                if (isCancel(shouldOverwrite)) {
                    cancel('Operation cancelled');
                    return;
                }

                if (!shouldOverwrite) {
                    throw new Error('Operation cancelled by user');
                }
            }

            // Files will be overwritten during copyTemplateFiles
        }
    } else if (targetDir !== '.') {
        mkdirSync(targetPath, { recursive: true });
    }

    // Handle current directory case
    if (targetDir === '.' && !isDirectoryEmpty(targetPath)) {
        if (!force) {
            const shouldOverwrite = await confirm({
                message:
                    'Current directory is not empty. Do you want to overwrite existing files?'
            });

            if (isCancel(shouldOverwrite)) {
                cancel('Operation cancelled');
                return;
            }

            if (!shouldOverwrite) {
                throw new Error('Operation cancelled by user');
            }
        }
    }

    copyTemplateFiles(templatePath, targetPath, variables);
}
