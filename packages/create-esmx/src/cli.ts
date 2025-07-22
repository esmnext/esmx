import {
    cancel,
    intro,
    isCancel,
    note,
    outro,
    select,
    text
} from '@clack/prompts';
import minimist from 'minimist';
import color from 'picocolors';
import { createProjectFromTemplate } from './project';
import { getAvailableTemplates, getEsmxVersion } from './template';
import type { CliOptions } from './types';
import { formatProjectName, getCommand } from './utils/index';

/**
 * Display help information
 */
function showHelp(userAgent?: string): void {
    const createCmd = getCommand('create', userAgent);

    console.log(`
${color.reset(color.bold(color.blue('🚀 Create Esmx Project')))}

${color.bold('Usage:')}
  ${createCmd} [project-name]
  ${createCmd} [project-name] [options]

${color.bold('Options:')}
  -t, --template <template>    Template to use (default: vue2-csr)
  -n, --name <name>            Project name or path
  -f, --force                  Force overwrite existing directory
  -h, --help                   Show help information
  -v, --version                Show version number

${color.bold('Examples:')}
  ${createCmd} my-project
  ${createCmd} my-project -t vue2-csr
  ${createCmd} my-project --force
  ${createCmd} . -f -t vue2-csr

${color.bold('Available Templates:')}
${getAvailableTemplates()
    .map((t) => `  ${t.folder.padEnd(25)} ${t.description}`)
    .join('\n')}

For more information, visit: ${color.cyan('https://esmnext.com')}
`);
}

/**
 * Get project name from arguments or prompt user
 */
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

/**
 * Get template type from arguments or prompt user
 */
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

/**
 * Main function to create a project
 */
export async function cli(options: CliOptions = {}): Promise<void> {
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
