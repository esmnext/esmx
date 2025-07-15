#!/usr/bin/env node

import {
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    statSync,
    writeFileSync
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    cancel,
    confirm,
    intro,
    isCancel,
    log,
    note,
    outro,
    select,
    text
} from '@clack/prompts';
import minimist from 'minimist';
import color from 'picocolors';
import {
    formatProjectName,
    getCommand,
    replaceTemplateVariables
} from './utils/index';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getEsmxVersion(): string {
    try {
        const packageJsonPath = resolve(__dirname, '../package.json');
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

        return packageJson.version || 'latest';
    } catch (error) {
        console.warn('Failed to read esmx version, using latest version');
        return 'latest';
    }
}

function getAvailableTemplates() {
    const templateDir = resolve(__dirname, '../template');
    if (!existsSync(templateDir)) {
        return {};
    }

    const templates: Record<
        string,
        { name: string; description: string; color: any }
    > = {};
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
            } catch (error) {
                // Use default description if parsing fails
            }
        }

        templates[folder] = {
            name: name,
            description: description,
            color: color.gray
        };
    }

    return templates;
}

interface TemplateVariables extends Record<string, string> {
    projectName: string;
    esmxVersion: string;
    installCommand: string;
    devCommand: string;
    buildCommand: string;
    startCommand: string;
    buildTypeCommand: string;
    lintTypeCommand: string;
}

function showHelp(): void {
    const createCmd = getCommand('create');

    console.log(`
${color.reset(color.bold(color.blue('🚀 Create Esmx Project')))}

Usage:
  ${createCmd} [project-name]
  ${createCmd} [project-name] [options]

Options:
  -t, --template <template>    Template to use (vue2-ssr)
  -n, --name <name>           Project name or path
  -h, --help                  Show help
  -v, --version               Show version

Examples:
  ${createCmd} my-project
  ${createCmd} my-project -t vue2-ssr
`);
}

export async function createProject(): Promise<void> {
    const argv = minimist(process.argv.slice(2), {
        string: ['template', 'name'],
        boolean: ['help', 'version'],
        alias: {
            t: 'template',
            n: 'name',
            h: 'help',
            v: 'version'
        }
    });

    if (argv.help) {
        showHelp();
        return;
    }

    if (argv.version) {
        console.log(getEsmxVersion());
        return;
    }

    console.log();
    intro(
        color.reset(
            color.bold(color.yellow('🚀 Welcome to Esmx Project Creator!'))
        )
    );

    try {
        const projectNameInput = await getProjectName(argv.name, argv._[0]);
        if (isCancel(projectNameInput)) {
            cancel('Operation cancelled');
            return;
        }

        const { packageName, targetDir } = formatProjectName(projectNameInput);

        const templateType = await getTemplateType(argv.template);
        if (isCancel(templateType)) {
            cancel('Operation cancelled');
            return;
        }

        const installCommand = getCommand('install');
        const devCommand = getCommand('dev');
        const buildCommand = getCommand('build');
        const startCommand = getCommand('start');
        const buildTypeCommand = getCommand('build:type');
        const lintTypeCommand = getCommand('lint:type');

        await createProjectFromTemplate(targetDir, templateType, {
            projectName: packageName,
            esmxVersion: getEsmxVersion(),
            installCommand,
            devCommand,
            buildCommand,
            startCommand,
            buildTypeCommand,
            lintTypeCommand
        });
        const installCmd = installCommand;
        const devCmd = devCommand;

        const nextSteps = [
            color.reset(`1. ${color.cyan(`cd ${targetDir}`)}`),
            color.reset(`2. ${color.cyan(installCmd)}`),
            color.reset(
                `3. ${color.cyan('git init')} ${color.gray('(optional)')}`
            ),
            color.reset(`4. ${color.cyan(devCmd)}`)
        ];

        note(nextSteps.join('\n'), 'Next steps');

        outro(color.reset(color.green('Happy coding! 🎉')));
    } catch (error) {
        if (error instanceof Error) {
            log.error(`Error: ${error.message}`);
        } else {
            log.error('An unknown error occurred');
        }
        process.exit(1);
    }
}

async function getProjectName(
    argName?: string,
    positionalName?: string
): Promise<string | symbol> {
    const providedName = argName || positionalName;
    if (providedName) {
        return providedName;
    }

    const projectName = await text({
        message: 'Project name or path:',
        placeholder: 'my-esmx-project',
        validate: (value: string) => {
            if (!value.trim()) {
                return 'Project name or path is required';
            }
            if (!/^[a-zA-Z0-9_.\/@-]+$/.test(value)) {
                return 'Project name or path should only contain letters, numbers, hyphens, underscores, dots, and slashes';
            }
        }
    });

    return String(projectName).trim();
}

async function getTemplateType(argTemplate?: string): Promise<string | symbol> {
    const availableTemplates = getAvailableTemplates();

    if (argTemplate && availableTemplates[argTemplate]) {
        return argTemplate;
    }

    const template = await select({
        message: 'Select a template:',
        options: Object.entries(availableTemplates).map(([key, template]) => ({
            label: color.reset(template.color(template.name)),
            value: key,
            hint: template.description
        }))
    });

    return template as string | symbol;
}

function isDirectoryEmpty(dirPath: string): boolean {
    if (!existsSync(dirPath)) {
        return true;
    }

    const files = readdirSync(dirPath);
    // Only consider non-hidden files and directories
    const nonHiddenFiles = files.filter((file) => !file.startsWith('.'));
    return nonHiddenFiles.length === 0;
}

async function createProjectFromTemplate(
    targetDir: string,
    templateType: string,
    variables: TemplateVariables
): Promise<void> {
    const templatePath = resolve(__dirname, '../template', templateType);
    const targetPath =
        targetDir === '.' ? process.cwd() : resolve(process.cwd(), targetDir);

    if (!existsSync(templatePath)) {
        throw new Error(`Template "${templateType}" not found`);
    }

    // Handle directory existence and overwrite confirmation
    if (targetDir !== '.' && existsSync(targetPath)) {
        if (!isDirectoryEmpty(targetPath)) {
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

            // Files will be overwritten during copyTemplateFiles
        }
    } else if (targetDir !== '.') {
        mkdirSync(targetPath, { recursive: true });
    }

    // Handle current directory case
    if (targetDir === '.' && !isDirectoryEmpty(targetPath)) {
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

    copyTemplateFiles(templatePath, targetPath, variables);
}

function copyTemplateFiles(
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

export default createProject;

if (import.meta.url === `file://${process.argv[1]}`) {
    createProject().catch((error) => {
        console.error('Error creating project:', error);
        process.exit(1);
    });
}
