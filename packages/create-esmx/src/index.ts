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

interface CreateProjectOptions {
    argv?: string[]; // Command line arguments
    cwd?: string; // Working directory
    userAgent?: string; // Package manager user agent
}

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

interface TemplateInfo {
    folder: string;
    name: string;
    description: string;
}

function getAvailableTemplates(): TemplateInfo[] {
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

function showHelp(userAgent?: string): void {
    const createCmd = getCommand('create', userAgent);

    console.log(`
${color.reset(color.bold(color.blue('🚀 Create Esmx Project')))}

${color.bold('Usage:')}
  ${createCmd} [project-name]
  ${createCmd} [project-name] [options]

${color.bold('Options:')}
  -t, --template <template>    Template to use (default: vue2)
  -n, --name <name>            Project name or path
  -f, --force                  Force overwrite existing directory
  -h, --help                   Show help information
  -v, --version                Show version number

${color.bold('Examples:')}
  ${createCmd} my-project
  ${createCmd} my-project -t vue2
  ${createCmd} my-project --force
  ${createCmd} . -f -t vue2

${color.bold('Available Templates:')}
${getAvailableTemplates()
    .map((t) => `  ${t.folder.padEnd(25)} ${t.description}`)
    .join('\n')}

For more information, visit: ${color.cyan('https://esmnext.com')}
`);
}

export async function createProject(
    options: CreateProjectOptions = {}
): Promise<void> {
    const { argv, cwd, userAgent } = options;
    const commandLineArgs = argv || process.argv.slice(2);
    const workingDir = cwd || process.cwd();

    const parsedArgs = minimist(commandLineArgs, {
        string: ['template', 'name'],
        boolean: ['help', 'version', 'force'],
        alias: {
            t: 'template',
            n: 'name',
            f: 'force',
            h: 'help',
            v: 'version'
        }
    });

    if (parsedArgs.help) {
        showHelp(userAgent);
        return;
    }

    if (parsedArgs.version) {
        console.log(getEsmxVersion());
        return;
    }

    console.log();
    intro(
        color.reset(
            color.bold(color.blue('🚀 Welcome to Esmx Project Creator!'))
        )
    );

    const projectNameInput = await getProjectName(
        parsedArgs.name,
        parsedArgs._[0]
    );
    if (isCancel(projectNameInput)) {
        cancel('Operation cancelled');
        return;
    }

    const { packageName, targetDir } = formatProjectName(
        projectNameInput,
        workingDir
    );

    const templateType = await getTemplateType(parsedArgs.template);
    if (isCancel(templateType)) {
        cancel('Operation cancelled');
        return;
    }

    const installCommand = getCommand('install', userAgent);
    const devCommand = getCommand('dev', userAgent);
    const buildCommand = getCommand('build', userAgent);
    const startCommand = getCommand('start', userAgent);
    const buildTypeCommand = getCommand('build:type', userAgent);
    const lintTypeCommand = getCommand('lint:type', userAgent);

    await createProjectFromTemplate(
        targetDir,
        templateType,
        workingDir,
        parsedArgs.force,
        {
            projectName: packageName,
            esmxVersion: getEsmxVersion(),
            installCommand,
            devCommand,
            buildCommand,
            startCommand,
            buildTypeCommand,
            lintTypeCommand
        }
    );
    const installCmd = installCommand;
    const devCmd = devCommand;

    const nextSteps = [
        color.reset(`1. ${color.cyan(`cd ${targetDir}`)}`),
        color.reset(`2. ${color.cyan(installCmd)}`),
        color.reset(`3. ${color.cyan('git init')} ${color.gray('(optional)')}`),
        color.reset(`4. ${color.cyan(devCmd)}`)
    ];

    note(nextSteps.join('\n'), 'Next steps');

    outro(color.reset(color.green('Happy coding! 🎉')));
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
            if (!/^[a-zA-Z0-9_.\/@-]+$/.test(value.trim())) {
                return 'Project name or path should only contain letters, numbers, hyphens, underscores, dots, and slashes';
            }
        }
    });

    return String(projectName).trim();
}

async function getTemplateType(argTemplate?: string): Promise<string | symbol> {
    const availableTemplates = getAvailableTemplates();

    if (
        argTemplate &&
        availableTemplates.some((t) => t.folder === argTemplate)
    ) {
        return argTemplate;
    }

    const options = availableTemplates.map((t) => ({
        label: color.reset(color.gray(`${t.folder} - `) + color.bold(t.name)),
        value: t.folder,
        hint: t.description
    }));

    const template = await select({
        message: 'Select a template:',
        options: options
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
    workingDir: string,
    force: boolean,
    variables: TemplateVariables
): Promise<void> {
    const templatePath = resolve(__dirname, '../template', templateType);
    const targetPath =
        targetDir === '.' ? workingDir : resolve(workingDir, targetDir);

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
