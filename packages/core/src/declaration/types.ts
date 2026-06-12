/**
 * RFC 0001 declaration layer types.
 *
 * The `esmx` field of package.json carries strictly local protocol facts:
 * a module declares only facts about itself (RFC P2).
 */
export interface EsmxDeclarationEntry {
    client?: string;
    server?: string;
}

export interface EsmxDeclarationExportFork {
    client?: string | false;
    server?: string | false;
}

export type EsmxDeclarationExportValue = string | EsmxDeclarationExportFork;

export interface EsmxDeclaration {
    entry?: EsmxDeclarationEntry;
    exports?: Record<string, EsmxDeclarationExportValue>;
    provides?: string[];
    uses?: string[];
}

/**
 * Complete diagnostic taxonomy from RFC 0001 §7, plus E_SCHEMA for
 * declaration shape violations (the RFC ships a JSON Schema but assigns
 * no code to schema failures; one code is needed so agents can detect them).
 */
export const DiagnosticCode = {
    E_NOT_LINKED: 'E_NOT_LINKED',
    E_NOT_BUILT: 'E_NOT_BUILT',
    E_CYCLE: 'E_CYCLE',
    E_VERSION: 'E_VERSION',
    E_NOT_USED: 'E_NOT_USED',
    E_NO_EXPORT: 'E_NO_EXPORT',
    E_PROTOCOL: 'E_PROTOCOL',
    E_PROTOCOL_IN_BEHAVIOR: 'E_PROTOCOL_IN_BEHAVIOR',
    E_SCHEMA: 'E_SCHEMA',
    W_MULTI_CANDIDATE: 'W_MULTI_CANDIDATE',
    W_NO_RANGE: 'W_NO_RANGE',
    W_TYPE_DRIFT: 'W_TYPE_DRIFT'
} as const;

export type DiagnosticCodeValue =
    (typeof DiagnosticCode)[keyof typeof DiagnosticCode];

export type DiagnosticSeverity = 'error' | 'warning';

export type DiagnosticCheck = 'intent' | 'substitution-safety';

/** Structured diagnostic matching the RFC `esmx validate --json` envelope. */
export interface Diagnostic {
    code: string;
    severity: DiagnosticSeverity;
    module: string;
    package?: string;
    check?: DiagnosticCheck;
    found?: string;
    required?: string;
    message: string;
    fix: string;
}
