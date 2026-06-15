import fs from 'node:fs';
import path from 'node:path';

import { validateDeclaration } from './schema';

import type { Diagnostic, EsmxDeclaration } from './types';

/** Package facts the resolver needs, read from a package root directory. */
export interface PackageRecord {
    name: string;
    version: string;
    root: string;
    private: boolean;
    dependencies: Record<string, string>;
    peerDependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    declaration: EsmxDeclaration | null;
    diagnostics: Diagnostic[];
}

export interface ReadDeclarationResult extends PackageRecord {
    declaration: EsmxDeclaration;
}

function readJsonFile(filePath: string): unknown | null {
    // Boundary adapter: fs/JSON throw; absence or malformed JSON means
    // "no readable package" for the resolver, which reports E_NOT_LINKED.
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return null;
    }
}

function toStringRecord(value: unknown): Record<string, string> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return {};
    }
    const result: Record<string, string> = {};
    for (const [key, entry] of Object.entries(value)) {
        if (typeof entry === 'string') {
            result[key] = entry;
        }
    }
    return result;
}

/**
 * Reads a package root's package.json into a PackageRecord, whether or not
 * it carries an `esmx` declaration. Returns null when no package.json can
 * be read.
 */
export function readPackageRecord(packageDir: string): PackageRecord | null {
    const json = readJsonFile(path.resolve(packageDir, 'package.json'));
    if (typeof json !== 'object' || json === null || Array.isArray(json)) {
        return null;
    }
    const pkg = json as Record<string, unknown>;
    const name = typeof pkg.name === 'string' ? pkg.name : '';
    const diagnostics: Diagnostic[] = [];
    let declaration: EsmxDeclaration | null = null;
    if (pkg.esmx !== undefined) {
        const validated = validateDeclaration(pkg.esmx, name || packageDir);
        diagnostics.push(...validated.diagnostics);
        declaration = validated.declaration ?? {};
    }
    return {
        name,
        version: typeof pkg.version === 'string' ? pkg.version : '',
        root: packageDir,
        private: pkg.private === true,
        dependencies: toStringRecord(pkg.dependencies),
        peerDependencies: toStringRecord(pkg.peerDependencies),
        devDependencies: toStringRecord(pkg.devDependencies),
        declaration,
        diagnostics
    };
}

/**
 * Reads a package's `esmx` declaration. Returns null when the package has
 * no `esmx` field (legacy module) or no readable package.json. Schema
 * violations are reported in `diagnostics` with the valid remainder kept.
 */
export function readDeclaration(
    packageDir: string
): ReadDeclarationResult | null {
    const record = readPackageRecord(packageDir);
    if (!record || record.declaration === null) {
        return null;
    }
    return { ...record, declaration: record.declaration };
}
