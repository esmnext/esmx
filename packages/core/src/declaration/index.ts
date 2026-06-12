import type { ModuleConfig } from '../module-config';
import { lowerDeclaration } from './lower';
import { readDeclaration } from './reader';
import type { ResolvedMount, ResolverEnvLinks, SupplyEntry } from './resolver';
import { resolveMounts } from './resolver';
import type { Diagnostic } from './types';

export { lowerDeclaration } from './lower';
export type { PackageRecord, ReadDeclarationResult } from './reader';
export { readDeclaration, readPackageRecord } from './reader';
export type {
    ResolvedMount,
    ResolveMountsResult,
    ResolverEnvLinks,
    SupplyEntry
} from './resolver';
export { resolveMounts } from './resolver';
export type { ValidateDeclarationResult } from './schema';
export { esmxDeclarationSchema, validateDeclaration } from './schema';
export { compareSemver, parseSemver, satisfiesRange } from './semver';
export type {
    Diagnostic,
    DiagnosticCheck,
    DiagnosticCodeValue,
    DiagnosticSeverity,
    EsmxDeclaration,
    EsmxDeclarationEntry,
    EsmxDeclarationExportFork,
    EsmxDeclarationExportValue
} from './types';
export { DiagnosticCode } from './types';

export interface ResolveDeclarationOptions {
    /**
     * Explicit mount overrides (environment fact): module name → artifact
     * directory, same semantics as today's `ModuleConfig.links` values,
     * resolved relative to `rootDir`.
     */
    envLinks?: ResolverEnvLinks;
}

export interface ResolveDeclarationResult {
    /** The declaration lowered to today's internal ModuleConfig IR. */
    config: ModuleConfig;
    /** Merged supply table: bare package → elected provider. */
    supply: Record<string, SupplyEntry>;
    /** Resolved mount table: module name → mounted artifact location. */
    mounts: Record<string, ResolvedMount>;
    diagnostics: Diagnostic[];
}

/**
 * One-call helper composing reader + resolver + lowering (RFC Phase 1).
 * Returns null when the package at `rootDir` has no `esmx` declaration.
 */
export function resolveDeclaration(
    rootDir: string,
    options: ResolveDeclarationOptions = {}
): ResolveDeclarationResult | null {
    const pkg = readDeclaration(rootDir);
    if (!pkg) {
        return null;
    }
    const resolution = resolveMounts(rootDir, pkg, options.envLinks);
    return {
        config: lowerDeclaration(pkg, resolution),
        supply: resolution.supply,
        mounts: resolution.mounts,
        diagnostics: resolution.diagnostics
    };
}

const PROTOCOL_MODULE_KEYS = ['lib', 'imports', 'exports', 'scopes'] as const;

function formatDiagnostic(diagnostic: Diagnostic): string {
    const location = diagnostic.package
        ? `${diagnostic.module} → ${diagnostic.package}`
        : diagnostic.module;
    return `[${diagnostic.code}] (${location}) ${diagnostic.message} Fix: ${diagnostic.fix}`;
}

/**
 * Integration point for `Esmx.init`: decides between the legacy
 * `options.modules` path and the declaration path.
 *
 * - No `esmx` field in package.json → legacy path, untouched.
 * - `esmx` field present and `options.modules` carries protocol facts
 *   (lib/imports/exports/scopes) → E_PROTOCOL_IN_BEHAVIOR (protocol facts
 *   must live in package.json only).
 * - `links` alone is an environment fact and is passed to the resolver as
 *   explicit mount overrides.
 */
export function resolveModuleOptions(
    rootDir: string,
    packageJson: Record<string, unknown>,
    modules?: ModuleConfig
): ModuleConfig | undefined {
    if (packageJson.esmx === undefined) {
        return modules;
    }
    if (modules) {
        const protocolKeys = PROTOCOL_MODULE_KEYS.filter(
            (key) => modules[key] !== undefined
        );
        if (protocolKeys.length > 0) {
            throw new Error(
                `[E_PROTOCOL_IN_BEHAVIOR] package.json declares "esmx" but options.modules contains protocol field(s): ${protocolKeys.join(', ')}. ` +
                    `Protocol facts must live in the package.json "esmx" field only; entry.node.ts keeps behavior (devApp, server, postBuild) and environment links. ` +
                    `Fix: move ${protocolKeys.join(', ')} into the "esmx" declaration and delete them from options.modules.`
            );
        }
    }
    const resolved = resolveDeclaration(rootDir, {
        envLinks: modules?.links
    });
    if (!resolved) {
        return modules;
    }
    const errors = resolved.diagnostics.filter(
        (diagnostic) => diagnostic.severity === 'error'
    );
    if (errors.length > 0) {
        throw new Error(
            `Esmx declaration resolution failed with ${errors.length} error(s):\n` +
                errors.map((error) => `  ${formatDiagnostic(error)}`).join('\n')
        );
    }
    for (const warning of resolved.diagnostics) {
        if (warning.severity === 'warning') {
            console.warn(formatDiagnostic(warning));
        }
    }
    return resolved.config;
}
