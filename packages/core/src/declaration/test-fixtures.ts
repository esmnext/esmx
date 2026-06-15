import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/** Test-only helpers building fake package trees in temp directories. */
export interface FixturePackage {
    /** Directory relative to the fixture root. */
    dir: string;
    packageJson: Record<string, unknown>;
    /** Write a dist/client/manifest.json stub (marks the module as built). */
    built?: boolean;
    /** Manifest content for the stub; implies `built`. */
    manifest?: Record<string, unknown>;
    /**
     * Skip auto-creating the empty source files for declared
     * `esmx.entry`/`esmx.exports` targets — use to trigger E_TARGET_MISSING.
     */
    noSources?: boolean;
}

/** Relative source paths an `esmx` declaration points at (entry + exports). */
function declaredTargets(esmx: unknown): string[] {
    if (typeof esmx !== 'object' || esmx === null) {
        return [];
    }
    const out: string[] = [];
    const decl = esmx as Record<string, unknown>;
    const entry = decl.entry;
    if (typeof entry === 'object' && entry !== null) {
        for (const side of Object.values(entry as Record<string, unknown>)) {
            if (typeof side === 'string') {
                out.push(side);
            }
        }
    }
    const exports = decl.exports;
    if (typeof exports === 'object' && exports !== null) {
        for (const value of Object.values(exports as Record<string, unknown>)) {
            if (typeof value === 'string') {
                out.push(value);
            } else if (typeof value === 'object' && value !== null) {
                for (const side of Object.values(
                    value as Record<string, unknown>
                )) {
                    if (typeof side === 'string') {
                        out.push(side);
                    }
                }
            }
        }
    }
    return out;
}

export async function createFixtureRoot(): Promise<string> {
    const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'esmx-declaration-'));
    // realpath once: macOS tmpdirs are symlinked (/var → /private/var).
    return fs.realpathSync(dir);
}

export function writeFixturePackage(
    rootDir: string,
    pkg: FixturePackage
): string {
    const dir = path.join(rootDir, pkg.dir);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
        path.join(dir, 'package.json'),
        JSON.stringify(pkg.packageJson, null, 4)
    );
    if (pkg.built || pkg.manifest) {
        const clientDir = path.join(dir, 'dist/client');
        fs.mkdirSync(clientDir, { recursive: true });
        fs.writeFileSync(
            path.join(clientDir, 'manifest.json'),
            JSON.stringify(pkg.manifest ?? {})
        );
    }
    // Auto-create empty source files for every declared entry/exports target
    // so fixtures satisfy the E_TARGET_MISSING existence check by default.
    if (!pkg.noSources) {
        for (const target of declaredTargets(pkg.packageJson.esmx)) {
            const file = path.resolve(dir, target);
            fs.mkdirSync(path.dirname(file), { recursive: true });
            if (!fs.existsSync(file)) {
                fs.writeFileSync(file, '');
            }
        }
    }
    return dir;
}

export async function removeFixtureRoot(rootDir: string): Promise<void> {
    await fsp.rm(rootDir, { recursive: true, force: true });
}
