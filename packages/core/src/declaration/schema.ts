import type {
    EsmxDeclaration,
    EsmxDeclarationEntry,
    EsmxDeclarationExportFork,
    EsmxDeclarationExportValue
} from './types';
import { type Diagnostic, DiagnosticCode } from './types';

/**
 * JSON Schema (draft 2020-12) for the package.json `esmx` field.
 * Exported for external tooling and publishing; `validateDeclaration`
 * enforces the same constraints structurally without a schema-validator
 * dependency.
 */
export const esmxDeclarationSchema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://esmx.dev/schema/esmx-declaration.json',
    title: 'Esmx module declaration (package.json "esmx" field)',
    type: 'object',
    additionalProperties: false,
    properties: {
        entry: {
            type: 'object',
            additionalProperties: false,
            properties: {
                client: { $ref: '#/$defs/relativePath' },
                server: { $ref: '#/$defs/relativePath' }
            }
        },
        exports: {
            type: 'object',
            propertyNames: { pattern: '^\\./.+' },
            additionalProperties: {
                anyOf: [
                    { $ref: '#/$defs/relativePath' },
                    {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            client: { $ref: '#/$defs/forkValue' },
                            server: { $ref: '#/$defs/forkValue' }
                        }
                    }
                ]
            }
        },
        provides: {
            type: 'array',
            items: { type: 'string', minLength: 1 }
        },
        uses: {
            type: 'array',
            items: { type: 'string', minLength: 1 }
        }
    },
    $defs: {
        relativePath: { type: 'string', pattern: '^\\./.+' },
        forkValue: {
            anyOf: [{ $ref: '#/$defs/relativePath' }, { const: false }]
        }
    }
} as const;

export interface ValidateDeclarationResult {
    declaration: EsmxDeclaration | null;
    diagnostics: Diagnostic[];
}

function schemaError(
    moduleName: string,
    message: string,
    fix: string
): Diagnostic {
    return {
        code: DiagnosticCode.E_SCHEMA,
        severity: 'error',
        module: moduleName,
        message,
        fix
    };
}

function isRelativePath(value: unknown): value is string {
    return typeof value === 'string' && /^\.\/.+/.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateEntry(
    value: unknown,
    moduleName: string,
    diagnostics: Diagnostic[]
): EsmxDeclarationEntry | undefined {
    if (!isRecord(value)) {
        diagnostics.push(
            schemaError(
                moduleName,
                `"esmx.entry" must be an object with optional "client"/"server" keys.`,
                `Declare entry as { "client": "./src/entry.client.ts", "server": "./src/entry.server.ts" }.`
            )
        );
        return undefined;
    }
    const entry: EsmxDeclarationEntry = {};
    for (const key of Object.keys(value)) {
        if (key !== 'client' && key !== 'server') {
            diagnostics.push(
                schemaError(
                    moduleName,
                    `"esmx.entry" has unknown key "${key}".`,
                    `Only "client" and "server" are allowed in "esmx.entry".`
                )
            );
            continue;
        }
        const side = value[key];
        if (!isRelativePath(side)) {
            diagnostics.push(
                schemaError(
                    moduleName,
                    `"esmx.entry.${key}" must be a relative "./" path, got ${JSON.stringify(side)}.`,
                    `Use a relative source path like "./src/entry.${key}.ts".`
                )
            );
            continue;
        }
        entry[key] = side;
    }
    return entry;
}

function validateExportFork(
    key: string,
    value: Record<string, unknown>,
    moduleName: string,
    diagnostics: Diagnostic[]
): EsmxDeclarationExportFork | null {
    const fork: EsmxDeclarationExportFork = {};
    let valid = true;
    for (const sideKey of Object.keys(value)) {
        if (sideKey !== 'client' && sideKey !== 'server') {
            diagnostics.push(
                schemaError(
                    moduleName,
                    `"esmx.exports['${key}']" has unknown key "${sideKey}".`,
                    `Env-fork export values allow only "client" and "server".`
                )
            );
            valid = false;
            continue;
        }
        const side = value[sideKey];
        if (side === false || isRelativePath(side)) {
            fork[sideKey] = side;
        } else {
            diagnostics.push(
                schemaError(
                    moduleName,
                    `"esmx.exports['${key}'].${sideKey}" must be a relative "./" path or false, got ${JSON.stringify(side)}.`,
                    `Point ${sideKey} at a relative source file, or use false to disable that side.`
                )
            );
            valid = false;
        }
    }
    return valid ? fork : null;
}

function validateExports(
    value: unknown,
    moduleName: string,
    diagnostics: Diagnostic[]
): Record<string, EsmxDeclarationExportValue> | undefined {
    if (!isRecord(value)) {
        diagnostics.push(
            schemaError(
                moduleName,
                `"esmx.exports" must be an object mapping "./<name>" subpaths to source files.`,
                `Declare exports as { "./widget": "./src/widget.ts" }.`
            )
        );
        return undefined;
    }
    const exports: Record<string, EsmxDeclarationExportValue> = {};
    for (const [key, exportValue] of Object.entries(value)) {
        if (!/^\.\/.+/.test(key)) {
            diagnostics.push(
                schemaError(
                    moduleName,
                    `"esmx.exports" key "${key}" must be a "./<name>" subpath.`,
                    `Rename the key to "./${key.replace(/^\.?\/?/, '')}".`
                )
            );
            continue;
        }
        if (isRelativePath(exportValue)) {
            exports[key] = exportValue;
            continue;
        }
        if (isRecord(exportValue)) {
            const fork = validateExportFork(
                key,
                exportValue,
                moduleName,
                diagnostics
            );
            if (fork) {
                exports[key] = fork;
            }
            continue;
        }
        diagnostics.push(
            schemaError(
                moduleName,
                `"esmx.exports['${key}']" must be a relative "./" path or a { client, server } fork, got ${JSON.stringify(exportValue)}.`,
                `Point the export at a relative source file like "./src/widget.ts".`
            )
        );
    }
    return exports;
}

function validateNameArray(
    field: 'provides' | 'uses',
    value: unknown,
    moduleName: string,
    diagnostics: Diagnostic[]
): string[] | undefined {
    if (!Array.isArray(value)) {
        diagnostics.push(
            schemaError(
                moduleName,
                `"esmx.${field}" must be an array of non-empty strings.`,
                `Declare ${field} as a string array, e.g. ["vue"].`
            )
        );
        return undefined;
    }
    const names: string[] = [];
    for (const item of value) {
        if (typeof item !== 'string' || item.length === 0) {
            diagnostics.push(
                schemaError(
                    moduleName,
                    `"esmx.${field}" entries must be non-empty strings, got ${JSON.stringify(item)}.`,
                    `Remove or replace the invalid ${field} entry.`
                )
            );
            continue;
        }
        names.push(item);
    }
    return names;
}

/**
 * Structural validator enforcing `esmxDeclarationSchema`. Invalid pieces
 * are dropped and reported; the returned declaration keeps the valid rest
 * so downstream diagnostics stay meaningful. Returns a null declaration
 * only when the field itself is not an object.
 */
export function validateDeclaration(
    value: unknown,
    moduleName: string
): ValidateDeclarationResult {
    const diagnostics: Diagnostic[] = [];
    if (!isRecord(value)) {
        diagnostics.push(
            schemaError(
                moduleName,
                `"esmx" field must be an object, got ${JSON.stringify(value)}.`,
                `Declare protocol facts as an object: { "entry": ..., "exports": ..., "provides": ..., "uses": ... }.`
            )
        );
        return { declaration: null, diagnostics };
    }
    const declaration: EsmxDeclaration = {};
    for (const key of Object.keys(value)) {
        switch (key) {
            case 'entry': {
                const entry = validateEntry(
                    value.entry,
                    moduleName,
                    diagnostics
                );
                if (entry) {
                    declaration.entry = entry;
                }
                break;
            }
            case 'exports': {
                const exports = validateExports(
                    value.exports,
                    moduleName,
                    diagnostics
                );
                if (exports) {
                    declaration.exports = exports;
                }
                break;
            }
            case 'provides': {
                const provides = validateNameArray(
                    'provides',
                    value.provides,
                    moduleName,
                    diagnostics
                );
                if (provides) {
                    declaration.provides = provides;
                }
                break;
            }
            case 'uses': {
                const uses = validateNameArray(
                    'uses',
                    value.uses,
                    moduleName,
                    diagnostics
                );
                if (uses) {
                    declaration.uses = uses;
                }
                break;
            }
            default:
                diagnostics.push(
                    schemaError(
                        moduleName,
                        `"esmx" has unknown key "${key}".`,
                        `Allowed keys are "entry", "exports", "provides", "uses".`
                    )
                );
        }
    }
    return { declaration, diagnostics };
}
