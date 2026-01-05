import {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    statSync,
    writeFileSync
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TemplateInfo, TemplateVariables } from './types';
import { replaceTemplateVariables } from './utils/index';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Get version of esmx from package.json
 */
export function getEsmxVersion(): string {
    try {
        const packageJsonPath = resolve(__dirname, '../package.json');
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

        return packageJson.version || 'latest';
    } catch (error) {
        console.warn('Failed to read esmx version, using latest version');
        return 'latest';
    }
}

/**
 * Get list of available templates
 */
export function getAvailableTemplates(): TemplateInfo[] {
    const templateDir = resolve(__dirname, '../template');

    const templates: TemplateInfo[] = [];
    const templateFolders = readdirSync(templateDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    for (const folder of templateFolders) {
        // Use folder name as display name
        const name = folder;

        // Try to read description from package.json
        const packageJsonPath = resolve(templateDir, folder, 'package.json');
        let description = `${name} template`;

        if (existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(
                    readFileSync(packageJsonPath, 'utf-8')
                );
                if (packageJson.description) {
                    description = packageJson.description;
                }
                templates.push({
                    folder,
                    name,
                    description
                });
            } catch (error) {
                // JSON parsing failed, skip this template
                console.warn(
                    `Warning: Failed to parse package.json for template '${folder}', skipping.`
                );
            }
        }
    }

    // Sort by name alphabetically
    return templates.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Check if directory is empty (ignoring hidden files)
 */
export function isDirectoryEmpty(dirPath: string): boolean {
    if (!existsSync(dirPath)) {
        return true;
    }

    const files = readdirSync(dirPath);
    // Only consider non-hidden files and directories
    const nonHiddenFiles = files.filter((file) => !file.startsWith('.'));
    return nonHiddenFiles.length === 0;
}

/**
 * Copy template files to target directory with variable replacement
 */
export function copyTemplateFiles(
    templatePath: string,
    targetPath: string,
    variables: TemplateVariables
): void {
    const files = readdirSync(templatePath);

    for (const file of files) {
        const filePath = join(templatePath, file);
        const targetFilePath = join(targetPath, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            mkdirSync(targetFilePath, { recursive: true });
            copyTemplateFiles(filePath, targetFilePath, variables);
        } else {
            let content = readFileSync(filePath, 'utf-8');

            // Replace all template variables using the utility function
            content = replaceTemplateVariables(content, variables);

            writeFileSync(targetFilePath, content);
        }
    }
}
