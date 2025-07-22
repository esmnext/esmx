/**
 * Options for project creation
 */
export interface CliOptions {
    argv?: string[]; // Command line arguments
    cwd?: string; // Working directory
    userAgent?: string; // Package manager user agent
    version?: string; // Esmx version override
}

/**
 * Template information structure
 */
export interface TemplateInfo {
    folder: string;
    name: string;
    description: string;
}

/**
 * Variables used in templates for replacement
 */
export interface TemplateVariables extends Record<string, string> {
    projectName: string;
    esmxVersion: string;
    installCommand: string;
    devCommand: string;
    buildCommand: string;
    startCommand: string;
    buildTypeCommand: string;
    lintTypeCommand: string;
}
