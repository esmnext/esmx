/**
 * Template variable replacement utilities
 */

/**
 * Replace template variables in content using mustache-style syntax {{variableName}}
 *
 * @param content - The content string containing template variables
 * @param variables - Object containing variable names and their replacement values
 * @returns Content with all template variables replaced
 *
 * @example
 * ```typescript
 * const content = "Hello {{name}}, version {{version}}!";
 * const variables = { name: "World", version: "1.0.0" };
 * const result = replaceTemplateVariables(content, variables);
 * // Result: "Hello World, version 1.0.0!"
 * ```
 */
export function replaceTemplateVariables(
    content: string,
    variables: Record<string, string>
): string {
    let result = content;

    // Iterate through all variables and replace them
    for (const [key, value] of Object.entries(variables)) {
        // Create regex pattern for {{variableName}} with global flag
        const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(pattern, value);
    }

    return result;
}
